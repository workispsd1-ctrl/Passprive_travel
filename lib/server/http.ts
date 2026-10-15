import "server-only";

type Json = Record<string, unknown>;

/** JSON response with the CORS headers the PHP endpoints sent on every reply. */
export function corsJson(
  body: Json,
  { status = 200, methods, pretty = false }: { status?: number; methods: string; pretty?: boolean },
): Response {
  return new Response(pretty ? JSON.stringify(body, null, 4) : JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(methods), "Content-Type": "application/json; charset=UTF-8" },
  });
}

export function corsHeaders(methods: string, allowHeaders = "Content-Type, Authorization, X-Requested-With") {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": allowHeaders,
  };
}

/** Mirrors `json_decode(file_get_contents('php://input'), true)`: null when the body is not valid JSON. */
export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return JSON.parse(await request.text());
  } catch {
    return null;
  }
}

/** PHP's `if (!$input)` check on a decoded body, plus "must be an array/object" for safe field access. */
export function asInput(decoded: unknown): Record<string, unknown> | null {
  if (!decoded || typeof decoded !== "object") return null;
  if (Object.keys(decoded).length === 0) return null;
  return decoded as Record<string, unknown>;
}
