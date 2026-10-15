/**
 * RateHawk B2B rate gateway with 15% agency markup, a date-based yield fallback,
 * and buffered free-cancellation deadlines. Port of api/rates.php.
 */
import type { NextRequest } from "next/server";

import { corsHeaders, corsJson } from "@/lib/server/http";
import { phpIntval } from "@/lib/server/php";
import { computeRates } from "@/lib/server/rates";

const METHODS = "GET, POST, OPTIONS";
const ALLOW_HEADERS = "Content-Type, Authorization";

export function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders(METHODS, ALLOW_HEADERS) });
}

async function handle(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const nights = params.get("nights");
  const rates = await computeRates({
    trip: params.get("trip"),
    checkin: params.get("checkin"),
    nights: nights !== null ? phpIntval(nights) : null,
  });
  const response = corsJson(rates, { methods: METHODS, pretty: true });
  response.headers.set("Access-Control-Allow-Headers", ALLOW_HEADERS);
  return response;
}

// rates.php read its parameters from the query string for both verbs.
export const GET = handle;
export const POST = handle;
