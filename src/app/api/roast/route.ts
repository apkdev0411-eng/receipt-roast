/**
 * POST /api/roast
 *
 * Accepts multipart form-data:
 *   - image: File (jpg/png)
 *   - mode: "duro" | "coach"
 *   - lang: "es" | "en"
 *
 * Pipeline:
 *   1. Validate image in memory (never written to disk).
 *   2. Demo short-circuit if DEMO_MODE or missing XAI_API_KEY.
 *   3. Vision extraction → JSON expenses.
 *   4. Text roast + insight → JSON.
 *   5. Return RoastResult. Image buffer is discarded when the request ends.
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

function normalizeLang(raw: FormDataEntryValue | null): "es" | "en" {
  if (raw === "en") return "en";
  return "es";
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("No se pudo leer el formulario.", "BAD_IMAGE");
  }

  const image = form.get("image");
  const mode = normalizeMode(form.get("mode"));
  const lang = normalizeLang(form.get("lang"));

  if (!mode) {
    return bad("Modo inválido. Usa 'duro' o 'coach'.", "BAD_IMAGE");
  }

  if (!(image instanceof File)) {
    return bad("Falta la imagen del ticket.", "BAD_IMAGE");
  }

  if (!ALLOWED_TYPES.has(image.type)) {
    return bad("Solo se aceptan imágenes JPG o PNG.", "BAD_IMAGE");
  }

  if (image.size > MAX_BYTES) {
    return bad("La imagen supera 12 MB.", "BAD_IMAGE");
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const dataUrl = `data:${image.type};base64,${buffer.toString("base64")}`;

  if (isDemoMode()) {
    const demo = getDemoResult(mode);
    return NextResponse.json({ ok: true, result: demo } satisfies RoastApiResponse);
  }

  try {
    const extractionRaw = await visionCompletion({
      system: EXTRACTION_SYSTEM_PROMPT,
      userText: EXTRACTION_USER_PROMPT,
      imageDataUrl: dataUrl,
    });

    const extraction = extractJsonObject(extractionRaw) as ReceiptExtraction;

    if (!extraction.isReceipt) {
      return bad(
        extraction.rejectionReason || "Esto no parece un ticket o extracto.",
        "NOT_A_RECEIPT",
      );
    }

    if (!extraction.expenses?.length) {
      return bad(
        "No pude leer ningún gasto en ese ticket. ¿Está nítido y completo?",
        "NOT_A_RECEIPT",
      );
    }

    const roastRaw = await textCompletion({
      system: getRoastSystemPrompt(mode, lang),
      user: buildRoastUserPrompt(mode, extraction, lang),
    });

    const roastJson = extractJsonObject(roastRaw) as {
      roast?: string;
      insight?: string;
    };

    const result: RoastResult = {
      mode,
      roast: (roastJson.roast || "").trim() || "Tu ticket sobrevivió al roast… por ahora.",
      insight: (roastJson.insight || "").trim() || "Revisa tus categorías más altas y recorta un 20% la próxima semana.",
      merchant: extraction.merchant,
      currency: extraction.currency || "MXN",
      date: extraction.date,
      expenses: extraction.expenses,
      total: extraction.total,
      demo: false,
    };

    return NextResponse.json({ ok: true, result } satisfies RoastApiResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido al llamar a xAI.";
    console.error("[api/roast]", message);
    return bad(`No pude procesar el ticket: ${message}`, "API_ERROR", 502);
  }
}