using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseHttpsRedirection();


app.MapPost("/call", async (HttpContext context) =>
{
  Console.WriteLine("🚩 Received request!");
  Stopwatch stopwatch = new Stopwatch();
  using var reader = new StreamReader(context.Request.Body);

  stopwatch.Start();
  var body = await reader.ReadToEndAsync();

  var process = new Process
  {
    StartInfo = new ProcessStartInfo
    {
      FileName = "/bin/bash",
      Arguments = $"-c \"ollama run llama3:latest \"{body}\"\"",
      RedirectStandardOutput = true,
      RedirectStandardError = true,
      UseShellExecute = false,
      CreateNoWindow = true
    }
  };

  process.Start();
  Console.WriteLine("🚩 Process started!");
  Console.WriteLine($"⚡️ Arguments: {process.StartInfo.Arguments}");

  string output = await process.StandardOutput.ReadToEndAsync();
  string error = await process.StandardError.ReadToEndAsync();

  process.WaitForExit();
  stopwatch.Stop();

  return Results.Ok($"{output}\n\nTime: {stopwatch.Elapsed.TotalSeconds}");
});

app.Run();

