/**
 * Project Lightshot — Passprive Travel
 * Serverless Lead Capture Handler (PRD Section 11.2 & Section 11.4).
 * Port of api/lead-capture.js.
 */
import type { NextRequest } from "next/server";

type CrewType = "couple" | "family" | "friends";
type FlightsNeeded = "yes" | "no" | "not_sure";

export interface LeadRecord {
  name: string;
  phone: string;
  email?: string;
  crew_type: CrewType;
  travel_dates: string;
  group_size: number;
  flights_needed: FlightsNeeded;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  submitted_at: string;
}

const VALID_CREWS: readonly CrewType[] = ["couple", "family", "friends"];
const VALID_FLIGHTS: readonly FlightsNeeded[] = ["yes", "no", "not_sure"];

const methodNotAllowed = () => Response.json({ error: "Method Not Allowed" }, { status: 405 });
export { methodNotAllowed as GET, methodNotAllowed as PUT, methodNotAllowed as DELETE, methodNotAllowed as PATCH };

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const record: LeadRecord = {
      name: String(body.name || "").trim(),
      phone: String(body.phone || "").trim(),
      email: body.email ? String(body.email).trim() : undefined,
      crew_type: VALID_CREWS.includes(body.crew_type as CrewType) ? (body.crew_type as CrewType) : "couple",
      travel_dates: String(body.travel_dates || "Flexible"),
      group_size: Number(body.group_size) || 2,
      flights_needed: VALID_FLIGHTS.includes(body.flights_needed as FlightsNeeded)
        ? (body.flights_needed as FlightsNeeded)
        : "not_sure",
      utm_source: (body.utm_source as string) || undefined,
      utm_medium: (body.utm_medium as string) || undefined,
      utm_campaign: (body.utm_campaign as string) || undefined,
      submitted_at: (body.submitted_at as string) || new Date().toISOString(),
    };

    if (!record.name || !record.phone) {
      return Response.json({ error: "Name and phone are required." }, { status: 400 });
    }

    // Production hook: append row to Google Sheets via Sheets API or send email via Resend
    return Response.json({
      ok: true,
      message: "Lead captured and routed to human Mauritius designer.",
      data: record,
    });
  } catch (err) {
    return Response.json(
      { error: "Lead capture error", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
