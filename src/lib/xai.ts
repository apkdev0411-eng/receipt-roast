/**
 * Thin client for xAI's OpenAI-compatible Chat Completions API.
 * Base URL: https://api.x.ai/v1
 *
 * Model IDs are configurable via env so the app survives model renames:
 *   XAI_VISION_MODEL  (default: grok-4)
 *   XAI_TEXT_MODEL    (default: grok-4)
 */

const XAI_BASE = "https://api.x.ai/v1";

export function getVisionModel(): string {
  return process.env.XAI_VISION_MODEL?.trim() || "grok-4";
}

export function getTextModel(): string {
  return process.env.XAI_TEXT_MODEL?.trim() || "grok-4";
}

export function getApiKey(): string | undefined {
  const key = process.env.XAI_API_KEY?.trim();
  return key || undefined;
}

export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === "true") return true;
  return !getApiKey();
}

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } };

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

export async function chatCompletion(params: {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Falta XAI_API_KEY.");
  }

  const res = await fetch(`${XAI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 2048,
    }),
  });

  const data = (await res.json()) as ChatCompletionResponse;

  if (!res.ok) {
    const msg = data.error?.message || `xAI HTTP ${res.status}`;
    throw new Error(msg);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("La API de xAI devolvió una respuesta vacía.");
  }
  return content;
}

/** Vision call: text + base64 data-URL image. */
export async function visionCompletion(params: {
  system: string;
  userText: string;
  imageDataUrl: string;
  temperature?: number;
}): Promise<string> {
  return chatCompletion({
    model: getVisionModel(),
    temperature: params.temperature ?? 0.2,
    maxTokens: 2048,
    messages: [
      { role: "system", content: params.system },
      {
        role: "user",
        content: [
          { type: "text", text: params.userText },
          {
            type: "image_url",
            image_url: { url: params.imageDataUrl, detail: "high" },
          },
        ],
      },
    ],
  });
}

/** Text-only call for the roast / insight step. */
export async function textCompletion(params: {
  system: string;
  user: string;
  temperature?: number;
}): Promise<string> {
  return chatCompletion({
    model: getTextModel(),
    temperature: params.temperature ?? 0.9,
    maxTokens: 1024,
    messages: [
      { role: "system", content: params.system },
      { role: "user", content: params.user },
    ],
  });
}
