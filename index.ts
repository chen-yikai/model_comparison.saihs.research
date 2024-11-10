import { Hono } from "hono";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

console.log("🚩 Service is starting...");

const openai = new OpenAI({
  apikey: process.env.OPENAI_API_KEY,
});
const app = new Hono();

app.post("/:model", async (c) => {
  const id = c.req.param("model");
  let result = null;
  let runTime;
  const _start_ = performance.now();
  switch (id) {
    case "gemini":
      console.log("⚡️ Gemini endpoint hit ⚡️");
      const body = await c.req.text();
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = "summary the html content: " + body;
      result = await model.generateContent(prompt);
      // console.log("🚀 Result:", result.response.text());
      break;
    case "claude":
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: "Hello, Claude" }],
      });
      console.log("🚀 Result:", msg);
      result = msg.choices[0].message.content;
    case "gpt":
      console.log("⚡️ GPT endpoint hit ⚡️");
      const completion = await openai.chat.completions.create({
        model: "o1-mini",
        messages: [{ role: "user", content: "hello" }],
      });
      result = completion.choices[0].message.content;
      break;
    default:
      return c.json({ error: "Model not found" }, 404);
  }
  const _end_ = performance.now();
  runTime = ((_end_ - _start_) / 1000).toFixed(2);
  return c.json({ message: result, time: runTime + "s" });
});

Bun.serve({
  fetch: app.fetch,
  port: process.env.PORT || 3000,
});
