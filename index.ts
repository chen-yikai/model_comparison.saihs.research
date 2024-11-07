import { Hono } from "hono";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("🚩 Service is starting...");

const openai = new OpenAI({
  apikey: process.env.OPENAI_API_KEY,
});
const app = new Hono();

app.get("/gemini", async (c) => {
  console.log("⚡️ Gemini endpoint hit ⚡️");

  const body = await c.req.text();
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  console.log(body);
  const prompt = "summary the html content: " + body;

  const result = await model.generateContent(prompt);
  console.log("🚀 Result:", result.response.text());
  return c.json({ message: result.response.text() });
});

app.get("/gpt", async (c) => {
  console.log("⚡️ GPT endpoint hit ⚡️");
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "write a haiku about ai" }],
    });
    return c.json({ message: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error fetching completion:", error);
    return c.json({ error: "Failed to fetch completion" }, 500);
  }
});

Bun.serve({
  fetch: app.fetch,
  port: process.env.PORT || 3000,
});
