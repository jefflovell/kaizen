#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const REPO_ROOT = "/Users/kaizen/Documents/kaizen";
const CLI_PATH = path.join(REPO_ROOT, "tools", "nano-banana.mjs");
const SERVER_INFO = {
  name: "nanner",
  version: "0.1.0",
};

let inputBuffer = Buffer.alloc(0);

function sendMessage(message) {
  const body = Buffer.from(JSON.stringify(message), "utf8");
  process.stdout.write(`Content-Length: ${body.length}\r\n\r\n`);
  process.stdout.write(body);
}

function sendResult(id, result) {
  sendMessage({ jsonrpc: "2.0", id, result });
}

function sendError(id, code, message, data) {
  sendMessage({
    jsonrpc: "2.0",
    id,
    error: { code, message, ...(data ? { data } : {}) },
  });
}

function readMessages() {
  while (true) {
    const headerEnd = inputBuffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) {
      return;
    }

    const header = inputBuffer.subarray(0, headerEnd).toString("utf8");
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) {
      inputBuffer = inputBuffer.subarray(headerEnd + 4);
      continue;
    }

    const contentLength = Number(match[1]);
    const messageStart = headerEnd + 4;
    const messageEnd = messageStart + contentLength;
    if (inputBuffer.length < messageEnd) {
      return;
    }

    const body = inputBuffer.subarray(messageStart, messageEnd).toString("utf8");
    inputBuffer = inputBuffer.subarray(messageEnd);

    try {
      handleMessage(JSON.parse(body));
    } catch (error) {
      sendError(null, -32700, "Parse error", String(error));
    }
  }
}

function runImageCommand(command, args) {
  return new Promise((resolve, reject) => {
    const prompt = args.prompt;
    if (!prompt || typeof prompt !== "string") {
      reject(new Error("Missing required string argument: prompt"));
      return;
    }

    const cliArgs = [
      CLI_PATH,
      command,
      "--json",
      "--prompt",
      prompt,
      "--model",
      args.model ?? "gemini-3.1-flash-image",
      "--aspect-ratio",
      args.aspect_ratio ?? "16:9",
      "--image-size",
      args.image_size ?? "1K",
      "--out",
      args.out ?? "tmp/nano-banana/generated-image.jpg",
    ];

    if (command === "edit") {
      if (!args.input && !args.input_path) {
        reject(new Error("Missing required string argument: input_path"));
        return;
      }
      cliArgs.push("--input", args.input ?? args.input_path);
    }

    const child = spawn(process.execPath, cliArgs, {
      cwd: REPO_ROOT,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `nano-banana CLI exited with ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(`Could not parse nano-banana CLI JSON: ${error.message}`));
      }
    });
  });
}

function generateImage(args) {
  return runImageCommand("generate", args);
}

function editImage(args) {
  return runImageCommand("edit", {
    ...args,
    out: args.out ?? "tmp/nano-banana/edited-image.jpg",
  });
}

function toolsList() {
  return {
    tools: [
      {
        name: "generate_image",
        description:
          "Generate an image with Google's Nano Banana/Gemini image API. Use this for nbanana, nanner, or Nano Banana image generation requests. Saves the generated image to the local Kaizen workspace and returns path, raw usage, and estimated cost.",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "Image prompt. Be explicit about subject, style, composition, and text.",
            },
            out: {
              type: "string",
              description:
                "Output path relative to /Users/kaizen/Documents/kaizen. Default: tmp/nano-banana/generated-image.jpg",
            },
            aspect_ratio: {
              type: "string",
              description: "Aspect ratio such as 16:9, 1:1, 4:3, or 3:2.",
              default: "16:9",
            },
            image_size: {
              type: "string",
              description: "Image size, usually 1K.",
              default: "1K",
            },
            model: {
              type: "string",
              description: "Gemini image model.",
              default: "gemini-3.1-flash-image",
            },
          },
          required: ["prompt"],
          additionalProperties: false,
        },
      },
      {
        name: "edit_image",
        description:
          "Edit an existing image with Google's Nano Banana/Gemini image API. Use this for nanner image revision requests such as changing labels, colors, styles, layout, or details in a prior generated image. Saves a new edited image and returns path, raw usage, and estimated cost.",
        inputSchema: {
          type: "object",
          properties: {
            input_path: {
              type: "string",
              description: "Path to the image to edit. Can be absolute or relative to /Users/kaizen/Documents/kaizen.",
            },
            prompt: {
              type: "string",
              description: "Edit instruction. Say what to change and what to preserve.",
            },
            out: {
              type: "string",
              description:
                "Output path relative to /Users/kaizen/Documents/kaizen. Default: tmp/nano-banana/edited-image.jpg",
            },
            aspect_ratio: {
              type: "string",
              description: "Aspect ratio such as 16:9, 1:1, 4:3, or 3:2.",
              default: "16:9",
            },
            image_size: {
              type: "string",
              description: "Image size, usually 1K.",
              default: "1K",
            },
            model: {
              type: "string",
              description: "Gemini image model.",
              default: "gemini-3.1-flash-image",
            },
          },
          required: ["input_path", "prompt"],
          additionalProperties: false,
        },
      },
    ],
  };
}

async function handleMessage(message) {
  const { id, method, params } = message;

  if (method === "initialize") {
    sendResult(id, {
      protocolVersion: params?.protocolVersion ?? "2024-11-05",
      capabilities: {
        tools: {},
      },
      serverInfo: SERVER_INFO,
    });
    return;
  }

  if (method === "notifications/initialized") {
    return;
  }

  if (method === "tools/list") {
    sendResult(id, toolsList());
    return;
  }

  if (method === "tools/call") {
    try {
      if (!["generate_image", "edit_image"].includes(params?.name)) {
        sendError(id, -32602, `Unknown tool: ${params?.name}`);
        return;
      }

      const result =
        params.name === "edit_image"
          ? await editImage(params.arguments ?? {})
          : await generateImage(params.arguments ?? {});
      sendResult(id, {
        content: [
          {
            type: "text",
            text: [
              `Image saved: ${result.outputPath}`,
              result.inputPath ? `Input image: ${result.inputPath}` : null,
              `MIME type: ${result.mimeType}`,
              `Model: ${result.model}`,
              `Aspect ratio: ${result.aspectRatio}`,
              `Image size: ${result.imageSize}`,
              `Raw usage: ${JSON.stringify(result.usage)}`,
              result.estimatedCost
                ? `Estimated cost: $${result.estimatedCost.total.toFixed(4)}`
                : "Estimated cost: unavailable",
            ].filter(Boolean).join("\n"),
          },
        ],
        structuredContent: result,
      });
    } catch (error) {
      sendError(id, -32000, error.message);
    }
    return;
  }

  sendError(id, -32601, `Method not found: ${method}`);
}

process.stdin.on("data", (chunk) => {
  inputBuffer = Buffer.concat([inputBuffer, chunk]);
  readMessages();
});
