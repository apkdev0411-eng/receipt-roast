/**
 * Helpers to coerce model output into typed JSON even when the model
 * wraps the payload in markdown fences or adds stray prose.
 */

export function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();

  // Strip ```json ... ``` fences if present.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    // Fall back to the first {...} block in the string.
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error("No se pudo parsear la respuesta del modelo como JSON.");
  }
}
