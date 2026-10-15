import type { Metadata } from "next";

import { LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = { title: "Terms of Service | PassPrivé Travel" };

export default function TermsPage() {
  return (
    <LegalShell
      kicker="Clear, transparent travel terms"
      title="Terms of Service"
      notice={
        <>
          These Terms of Service govern your relationship with <strong>Passprive Platforms Private Ltd</strong> (&quot;PassPrivé&quot;,
          &quot;Company&quot;, &quot;we&quot;, &quot;us&quot;) regarding all travel planning, itinerary curation, logistics coordination, and
          PassPrivé App platform services.
        </>
      }
    >
      <h2>1. Travel Planning &amp; Advisory Services</h2>
      <p>
        PassPrivé Travel acts as an itinerary curation, travel designer, and trip coordination concierge for Mauritius vacations. We curate tailored
        packages covering accommodation reservations, private chauffeured transfers, licensed boat charters, and curated excursions with verified
        local operators.
      </p>

      <h2>2. Quotes, Inclusions &amp; Milestone Payments</h2>
      <ul>
        <li>
          All initial proposals and quotes shared via WhatsApp or email provide itemized inclusions, hotel star ratings, meal plans (such as
          Half-Board), and tour details.
        </li>
        <li>
          Bookings are confirmed upon agreement to your custom plan and completion of scheduled milestone payments. Milestone payment structures are
          shared transparently prior to commitment.
        </li>
        <li>
          Unless explicitly stated in your final confirmed itinerary voucher, international flight fares, personal travel insurance, visa entry fees
          (if applicable), and personal discretionary expenditures are excluded.
        </li>
      </ul>

      <h2>3. Dedicated Chauffeur &amp; Excursion Logistics</h2>
      <ul>
        <li>Your dedicated private chauffeur vehicle is reserved exclusively for your travel group based on the agreed itinerary schedule.</li>
        <li>
          Activities such as catamaran cruises, marine park snorkeling, and nature safari entries depend on safe weather conditions and local
          maritime authority permissions. If bad weather prevents an activity, our on-ground team will reschedule the excursion or provide an
          alternate verified experience.
        </li>
      </ul>

      <h2>4. Complimentary PassPrivé VIP App Privileges</h2>
      <ul>
        <li>Confirmed travelers receive complimentary VIP access to the PassPrivé App for the duration of their trip.</li>
        <li>
          PassPrivé App features include priority table reservations at participating Mauritius partner dining venues, exclusive perks, and instant
          cashback credited in accordance with partner merchant terms.
        </li>
        <li>
          PassPrivé Platforms Private Ltd is not responsible for food preparation or restaurant service quality at third-party partner
          establishments.
        </li>
      </ul>

      <h2>5. Traveler Responsibilities</h2>
      <p>
        Travelers are responsible for maintaining valid passports (with at least 6 months validity from departure date), relevant entry
        documentation, and personal travel/medical insurance. Travelers agree to follow local safety regulations during marine activities and
        excursions.
      </p>

      <h2>6. Governing Law &amp; Jurisdiction</h2>
      <p>
        These terms are governed by the laws of India. Any disputes arising in connection with services rendered by{" "}
        <strong>Passprive Platforms Private Ltd</strong> shall be subject to the exclusive jurisdiction of the competent courts in India.
      </p>

      <h2>7. Contact &amp; Support</h2>
      <p>
        For questions or assistance regarding your booking terms, reach out to our concierge team at <strong>concierge@passprive.travel</strong> or
        contact our official WhatsApp support channel.
      </p>
    </LegalShell>
  );
}
