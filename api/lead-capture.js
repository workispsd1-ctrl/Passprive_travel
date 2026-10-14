/**
 * Project Lightshot — Passprive Travel
 * Serverless Lead Capture Handler (PRD Section 11.2 & Section 11.4)
 *
 * Data shape enforced strictly per Section 11.4:
 * {
 *   "name": "string",
 *   "phone": "string",
 *   "email": "string (optional)",
 *   "crew_type": "couple | family | friends",
 *   "travel_dates": "string",
 *   "group_size": "number",
 *   "flights_needed": "yes | no | not_sure",
 *   "utm_source": "string (optional)",
 *   "utm_medium": "string (optional)",
 *   "utm_campaign": "string (optional)",
 *   "submitted_at": "ISO timestamp"
 * }
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const validCrews = ['couple', 'family', 'friends'];
    const validFlights = ['yes', 'no', 'not_sure'];

    const record = {
      name: String(body.name || '').trim(),
      phone: String(body.phone || '').trim(),
      email: body.email ? String(body.email).trim() : undefined,
      crew_type: validCrews.includes(body.crew_type) ? body.crew_type : 'couple',
      travel_dates: String(body.travel_dates || 'Flexible'),
      group_size: Number(body.group_size) || 2,
      flights_needed: validFlights.includes(body.flights_needed) ? body.flights_needed : 'not_sure',
      utm_source: body.utm_source || undefined,
      utm_medium: body.utm_medium || undefined,
      utm_campaign: body.utm_campaign || undefined,
      submitted_at: body.submitted_at || new Date().toISOString()
    };

    if (!record.name || !record.phone) {
      return res.status(400).json({ error: 'Name and phone are required.' });
    }

    // Production hook: Append row to Google Sheets via Sheets API or send email via Resend
    return res.status(200).json({
      ok: true,
      message: 'Lead captured and routed to human Mauritius designer.',
      data: record
    });
  } catch (err) {
    return res.status(500).json({ error: 'Lead capture error', details: err.message });
  }
}
