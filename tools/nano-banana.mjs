#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_MODEL = "gemini-3.1-flash-image";
const DEFAULT_ASPECT_RATIO = "16:9";
const DEFAULT_IMAGE_SIZE = "1K";
const DEFAULT_OUT = "tmp/nano-banana/generated-image.jpg";
const PRICING_USD_PER_MILLION_TOKENS = {
  "gemini-3.1-flash-image": {
    input: 0.5,
    textOutput: 3,
    imageOutput: 60,
  },
  "gemini-3.1-flash-lite-image": {
    input: 0.25,
    textOutput: 1.5,
    imageOutput: 30,
  },
  "gemini-3-pro-image": {
    input: 2,
    textOutput: 12,
    imageOutput: 120,
  },
  "gemini-2.5-flash-image": {
    input: 0.3,
    textOutput: 2.5,
    imageOutput: 30,
  },
};

function printUsage() {
  console.log(`Usage:
  node tools/nano-banana.mjs generate --prompt "..." [--out file.jpg] [--aspect-ratio 16:9] [--image-size 1K] [--model gemini-3.1-flash-image]
  node tools/nano-banana.mjs edit --input image.jpg --prompt "..." [--out edited.jpg] [--aspect-ratio 16:9] [--image-size 1K] [--model gemini-3.1-flash-image]

Examples:
  node tools/nano-banana.mjs generate --prompt "A clean educational diagram" --out tmp/nano-banana/test.jpg
  node tools/nano-banana.mjs edit --input tmp/nano-banana/test.jpg --prompt "Make the labels larger" --out tmp/nano-banana/test-edited.jpg
`);
}

function parseArgs(argv) {
  const [, , command, ...rest] = argv;
  const options = {
    command,
    help: command === "--help" || command === "-h",
    model: DEFAULT_MODEL,
    aspectRatio: DEFAULT_ASPECT_RATIO,
    imageSize: DEFAULT_IMAGE_SIZE,
    out: DEFAULT_OUT,
  };

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    const next = rest[index + 1];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--prompt" || arg === "-p") {
      options.prompt = next;
      index += 1;
    } else if (arg === "--out" || arg === "-o") {
      options.out = next;
      index += 1;
    } else if (arg === "--input" || arg === "-i" || arg === "--input-image") {
      options.input = next;
      index += 1;
    } else if (arg === "--aspect-ratio") {
      options.aspectRatio = next;
      index += 1;
    } else if (arg === "--image-size") {
      options.imageSize = next;
      index += 1;
    } else if (arg === "--model") {
      options.model = next;
      index += 1;
    } else if (arg === "--json") {
      options.json = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

async function loadDotEnv(filePath = ".env") {
  let contents;

  try {
    contents = await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }
    throw error;
  }

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function findImagePart(responseJson) {
  if (responseJson?.output_image?.data) {
    return { inlineData: responseJson.output_image };
  }

  const stepContent = responseJson?.steps
    ?.flatMap((step) => step.content ?? [])
    ?.find((content) => content.data && content.type?.toLowerCase().includes("image"));
  if (stepContent) {
    return { inlineData: stepContent };
  }

  const parts = responseJson?.candidates?.[0]?.content?.parts ?? [];
  return parts.find((part) => part.inlineData?.data || part.inline_data?.data);
}

function imagePartToBuffer(part) {
  const inlineData = part.inlineData ?? part.inline_data;
  return Buffer.from(inlineData.data, "base64");
}

function mimeTypeForBuffer(buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return "image/jpeg";
  }
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp";
  }

  return "application/octet-stream";
}

function mimeTypeForImagePart(part, buffer) {
  const inlineData = part.inlineData ?? part.inline_data;
  const declaredType = inlineData.mimeType ?? inlineData.mime_type ?? inlineData.type;

  if (declaredType?.startsWith("image/")) {
    return declaredType;
  }

  return mimeTypeForBuffer(buffer);
}

function extensionForMimeType(mimeType) {
  if (mimeType === "image/jpeg") {
    return ".jpg";
  }
  if (mimeType === "image/png") {
    return ".png";
  }
  if (mimeType === "image/webp") {
    return ".webp";
  }
  return "";
}

function pathWithImageExtension(outputPath, mimeType) {
  const expectedExtension = extensionForMimeType(mimeType);
  if (!expectedExtension) {
    return outputPath;
  }

  const parsed = path.parse(outputPath);
  const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
  if (!parsed.ext) {
    return `${outputPath}${expectedExtension}`;
  }
  if (imageExtensions.has(parsed.ext.toLowerCase()) && parsed.ext.toLowerCase() !== expectedExtension) {
    return path.join(parsed.dir, `${parsed.name}${expectedExtension}`);
  }

  return outputPath;
}

function tokensForModality(modalities = [], modality) {
  return modalities
    .filter((entry) => entry.modality === modality)
    .reduce((total, entry) => total + (entry.tokens ?? 0), 0);
}

function estimateUsageCostUsd(model, usage) {
  const pricing = PRICING_USD_PER_MILLION_TOKENS[model];
  if (!pricing || !usage) {
    return null;
  }

  const imageOutputTokens = tokensForModality(usage.output_tokens_by_modality, "image");
  const textOutputTokens = Math.max((usage.total_output_tokens ?? 0) - imageOutputTokens, 0);
  const inputTokens = usage.total_input_tokens ?? 0;

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const textOutputCost = (textOutputTokens / 1_000_000) * pricing.textOutput;
  const imageOutputCost = (imageOutputTokens / 1_000_000) * pricing.imageOutput;

  return {
    total: inputCost + textOutputCost + imageOutputCost,
    input: inputCost,
    textOutput: textOutputCost,
    imageOutput: imageOutputCost,
  };
}

function formatUsd(amount) {
  if (amount < 0.01) {
    return `$${amount.toFixed(4)}`;
  }
  return `$${amount.toFixed(3)}`;
}

async function generateImage({ prompt, out, model, aspectRatio, imageSize }) {
  return createImage({ command: "generate", prompt, out, model, aspectRatio, imageSize });
}

async function editImage({ prompt, input, out, model, aspectRatio, imageSize }) {
  if (!input) {
    throw new Error('Missing required --input "image.jpg" for edit');
  }

  return createImage({ command: "edit", prompt, input, out, model, aspectRatio, imageSize });
}

async function createImage({ command, prompt, input, out, model, aspectRatio, imageSize }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("replace-me") || apiKey.includes("your-gemini")) {
    throw new Error("Missing GEMINI_API_KEY. Add it to .env first.");
  }

  let interactionInput = prompt;
  let inputPath = null;
  if (input) {
    inputPath = path.resolve(input);
    const inputBuffer = await readFile(inputPath);
    const inputMimeType = mimeTypeForBuffer(inputBuffer);
    if (!inputMimeType.startsWith("image/")) {
      throw new Error(`Unsupported input image type: ${input}`);
    }

    interactionInput = [
      { type: "text", text: prompt },
      {
        type: "image",
        mime_type: inputMimeType,
        data: inputBuffer.toString("base64"),
      },
    ];
  }

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      model,
      input: interactionInput,
      response_format: {
        type: "image",
        aspect_ratio: aspectRatio,
        image_size: imageSize,
      },
    }),
  });

  const responseText = await response.text();
  let responseJson;
  try {
    responseJson = JSON.parse(responseText);
  } catch {
    responseJson = null;
  }

  if (!response.ok) {
    const message =
      responseJson?.error?.message ??
      responseText.slice(0, 500) ??
      `HTTP ${response.status}`;
    throw new Error(`Gemini image request failed: ${message}`);
  }

  const imagePart = findImagePart(responseJson);
  if (!imagePart) {
    throw new Error("Gemini returned no image data.");
  }

  const imageBuffer = imagePartToBuffer(imagePart);
  const mimeType = mimeTypeForImagePart(imagePart, imageBuffer);
  const outputPath = path.resolve(pathWithImageExtension(out, mimeType));
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, imageBuffer);

  return {
    outputPath,
    command,
    inputPath,
    mimeType,
    model,
    aspectRatio,
    imageSize,
    usage: responseJson.usage,
    estimatedCost: estimateUsageCostUsd(model, responseJson.usage),
  };
}

async function main() {
  const options = parseArgs(process.argv);

  if (options.help || !["generate", "edit"].includes(options.command)) {
    printUsage();
    process.exit(options.help ? 0 : 1);
  }

  if (!options.prompt) {
    throw new Error('Missing required --prompt "..."');
  }

  await loadDotEnv();
  const result = options.command === "edit" ? await editImage(options) : await generateImage(options);
  const { outputPath, usage, estimatedCost } = result;
  if (options.json) {
    console.log(JSON.stringify(result));
    return;
  }

  console.log(`Image saved: ${outputPath}`);
  if (usage) {
    console.log(`Raw usage: ${JSON.stringify(usage)}`);
  }
  if (estimatedCost) {
    console.log(
      `Estimated cost: ${formatUsd(estimatedCost.total)} ` +
        `(input ${formatUsd(estimatedCost.input)}, text output ${formatUsd(estimatedCost.textOutput)}, image output ${formatUsd(estimatedCost.imageOutput)})`,
    );
  } else {
    console.log("Estimated cost: unavailable for this model");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
