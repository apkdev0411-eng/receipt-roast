/**
 * POST /api/roast
 *
 * Accepts multipart form-data:
 *   - image: File (jpg/png)
 *   - mode: "duro" | "coach"
 *   - lang: "es" | "en"
 */

import { NextRequest, NextResponse } from "next/server";
import { getDemoResult } from "@/lib/demo";
import { extractJsonObject } from "@/lib/parse";
import {
  EXTRACTION_SYSTEM_PROMPT,
  EXTRACTION_USER_PROMPT,
  buildRoastUserPrompt,
  getRoastSystemPrompt,
} from "@/lib/prompts";
import type {
  ExpenseItem,
  ReceiptExtraction,
  RoastApiResponse,
  RoastMode,
  RoastResult,
} from "@/lib/types";
import { isDemoMode, textCompletion, visionCompletion } from "@/lib/xai";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);

function bad(
  error: string,
  code: NonNullable<Extract<RoastApiResponse, { ok: false }>["code"]>,
  status = 400,
) {
  const body: RoastApiResponse = { ok: false, error, code };
  return NextResponse.json(body, { status });
}

function normalizeMode(raw: FormDataEntryValue | null): RoastMode | null {
  if (raw === "duro" || raw === "coach") return raw;
  return null;
}

function toDataUrl(mime: string, buffer: Buffer): string {
  const safe = mime === "image/jpg" ? "image/jpeg" : mime;
  return `data:${safe};base64,${buffer.toString("base64")}`;
}

function coerceExtraction(raw: unknown): ReceiptExtraction {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const expensesRaw = Array.isArray(obj.expenses) ? obj.expenses : [];
  const expenses: ExpenseItem[] = expensesRaw
    .map((item) => {
      const e = item as Record<string, unknown>;
      return {
        name: String(e.name ?? "Ítem").slice(0, 120),
        amount: Number(e.amount) || 0,
        category: String(e.category ?? "otros").slice(0, 40),
      };
    })
    .filter((e) => e.amount > 0 || e.name);

  const totalFromItems = expenses.reduce((s, e) => s + e.amount, 0);
  const total = Number(obj.total);
  const finalTotal = Number.isFinite(total) && total > 0 ? total : totalFromItems;

  let currency = typeof obj.currency === "string" && obj.currency ? obj.currency.toUpperCase() : "MXN";

  if (currency === "MXN" && finalTotal > 15000) {
    currency = "USD";
  }
  if (currency === "USD" && finalTotal < 100) {
    currency = "MXN";
  }
  if (["US$", "DOLAR", "DOLARES", "DOLLAR", "DOLLARS"].includes(currency)) currency = "USD";
  if (["PESO", "PESOS", "M.N.", "MN"].includes(currency)) currency = "MXN";

  return {
    isReceipt: Boolean(obj.isReceipt),
    rejectionReason: typeof obj.rejectionReason === "string" ? obj.rejectionReason : undefined,
    merchant: typeof obj.merchant === "string" ? obj.merchant : undefined,
    currency,
    date: typeof obj.date === "string" ? obj.date : undefined,
    expenses,
    total: finalTotal,
  };
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("No se pudo leer el formulario.", "BAD_IMAGE");
  }

  const mode = normalizeMode(form.get("mode"));
  if (!mode) {
    return bad('Modo inválido. Usa "duro" o "coach".', "BAD_IMAGE");
  }

  const lang = form.get("lang") === "en" ? "en" : "es";

  const file = form.get("image");
  if (!file || !(file instanceof File)) {
    return bad("Falta la imagen del ticket.", "MISSING_IMAGE");
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return bad("Solo se aceptan imágenes JPG o PNG.", "BAD_IMAGE");
  }

  if (file.size <= 0 || file.size > MAX_BYTES) {
    return bad("La imagen es demasiado grande o está vacía (máx. 12 MB).", "BAD_IMAGE");
  }

  if (isDemoMode()) {
    await file.arrayBuffer();
    const result = getDemoResult(mode);
    const body: RoastApiResponse = { ok: true, result };
    return NextResponse.json(body);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = toDataUrl(file.type, buffer);

  try {
    const extractionRaw = await visionCompletion({
      system: EXTRACTION_SYSTEM_PROMPT,
      userText: EXTRACTION_USER_PROMPT,
      imageDataUrl: dataUrl,
    });
    const extraction = coerceExtraction(extractJsonObject(extractionRaw));

    if (!extraction.isReceipt) {
      return bad(
        extraction.rejectionReason || "Esa imagen no parece un ticket o extracto.",
        "NOT_A_RECEIPT",
      );
    }

    if (!extraction.expenses.length) {
      return bad("No pude leer ningún gasto en ese ticket.", "NOT_A_RECEIPT");
    }

    const roastRaw = await textCompletion({
      system: getRoastSystemPrompt(mode, lang),
      user: buildRoastUserPrompt(mode, extraction, lang),
    });
    const roastJson = extractJsonObject(roastRaw) as {
      roast?: string;
      insight?: string;
      meme?: string;
    };

    const result: RoastResult = {
      mode,
      roast:
        (roastJson.roast || "").trim() ||
        (lang === "en" ? "Your receipt survived... for now." : "Tu ticket sobrevivió al roast… por ahora."),
      insight: (roastJson.insight || "").trim() || "",
      meme: (roastJson.meme || "").trim() || undefined,
      merchant: extraction.merchant,
      currency: extraction.currency || "MXN",
      date: extraction.date,
      expenses: extraction.expenses,
      total: extraction.total,
      demo: false,
    };

    const body: RoastApiResponse = { ok: true, result };
    return NextResponse.json(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido.";
    console.error("[api/roast]", message);
    return bad(`No pude procesar el ticket: ${message}`, "API_ERROR", 502);
  }
}