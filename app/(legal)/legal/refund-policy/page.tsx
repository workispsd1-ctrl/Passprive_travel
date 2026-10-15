import type { Metadata } from "next";

import { LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = { title: "Cancellation & Refund Policy | PassPrivé Travel" };

export default function RefundPolicyPage() {
  return (
    <LegalShell
      kicker="Fair, transparent & reliable"
      title="Cancellation & Refund Policy"
      notice={
        <>
          This Cancellation &amp; Refund Policy applies to all handcrafted travel itineraries, resort bookings, and ground logistics arranged by{" "}
          <strong>Passprive Platforms Private Ltd</strong> (&quot;PassPrivé&quot;).
        </>
      }
    >
      <h2>1. Custom Trip Planning &amp; Itinerary Flexibility</h2>
      <p>
        All customized day-by-day itineraries and activity selections can be modified free of charge during the planning phase prior to the
        issuance of confirmed resort vouchers and ticketed bookings.
      </p>

      <h2>2. Milestone Cancellation Schedule</h2>
      <p>
        Because resort rooms and private boat charters in Mauritius are reserved well in advance, cancellation refunds are governed by the following
        clear timeframes:
      </p>

      <table>
        <thead>
          <tr>
            <th>Cancellation Request Received</th>
            <th>Refund Eligibility</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>30 or more days before departure date</td>
            <td>Full refund of amounts paid, minus nominal banking/merchant transaction charges and non-refundable hotel advance deposits.</td>
          </tr>
          <tr>
            <td>15 to 29 days before departure date</td>
            <td>50% refund of total trip package cost, subject to resort partner cancellation terms.</td>
          </tr>
          <tr>
            <td>Less than 15 days before departure date</td>
            <td>
              Non-refundable due to guaranteed resort commitments and private vehicle/skipper reservations. Any recoverable activity fees will be
              refunded.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>3. Weather &amp; Force Majeure Excursion Adjustments</h2>
      <p>
        Mauritius maritime authorities occasionally issue safety advisories restricting sea excursions (such as catamaran cruises to Coin de Mire,
        Gabriel Island, or Blue Bay snorkeling) during heavy seas or unfavorable weather. In such cases:
      </p>
      <ul>
        <li>Our on-ground team will first reschedule the excursion to another day during your stay at zero extra cost.</li>
        <li>
          If rescheduling is impossible due to departure flight timings, the full fee for that specific excursion will be refunded or replaced with
          an equivalent verified inland experience.
        </li>
      </ul>

      <h2>4. Flight Cancellations &amp; Rescheduling</h2>
      <p>
        PassPrivé Platforms Private Ltd coordinates ground logistics, resort stays, and island activities. Flights booked independently or through
        partner airlines are subject to the respective airline&apos;s fare rules and cancellation policies.
      </p>

      <h2>5. Refund Processing Timeline</h2>
      <p>
        Approved refunds are processed to the original payment method within <strong>7 to 10 business days</strong>. Written confirmation with
        reference transaction IDs will be shared via email and WhatsApp upon initiation.
      </p>

      <h2>6. How to Request a Cancellation or Refund</h2>
      <p>
        To request a cancellation, date change, or refund, submit your booking reference and travel details in writing to{" "}
        <strong>concierge@passprive.travel</strong> or message your dedicated concierge via the official WhatsApp channel.
      </p>
    </LegalShell>
  );
}
