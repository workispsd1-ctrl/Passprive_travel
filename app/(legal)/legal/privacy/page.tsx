import type { Metadata } from "next";

import { LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = { title: "Privacy Policy | PassPrivé Travel" };

export default function PrivacyPage() {
  return (
    <LegalShell
      kicker="Your privacy is protected"
      title="Privacy Policy"
      notice={
        <>
          This service is operated by <strong>Passprive Platforms Private Ltd</strong> (&quot;PassPrivé&quot;, &quot;we&quot;, &quot;our&quot;, or
          &quot;us&quot;). We are committed to safeguarding your personal data in compliance with applicable data protection laws.
        </>
      }
    >
      <h2>1. Information We Collect</h2>
      <p>When you use PassPrivé Travel to plan, customize, or book your trip, we collect information necessary to deliver travel services:</p>
      <ul>
        <li>
          <strong>Contact Information:</strong> Your name, WhatsApp phone number, and email address to share custom itinerary proposals, hotel
          vouchers, and booking updates.
        </li>
        <li>
          <strong>Trip Preferences:</strong> Travel dates, traveler type (couples, families, or groups), group size, accommodation preferences, and
          flight requirements.
        </li>
        <li>
          <strong>On-Ground Service Details:</strong> Flight arrival and departure details strictly for scheduling your private chauffeur airport
          pick-ups and excursions.
        </li>
        <li>
          <strong>PassPrivé App Usage Data:</strong> Reservation timestamps and participating partner dining bill redemption tokens for cashback
          processing.
        </li>
      </ul>

      <h2>2. How We Use Your Data</h2>
      <p>Your data is processed strictly for the following purposes:</p>
      <ul>
        <li>Creating, refining, and sharing your personalized Mauritius day-by-day itinerary proposal.</li>
        <li>Confirming hotel accommodations, private transport logistics, and activity permits on your behalf.</li>
        <li>Activating complimentary VIP access to the PassPrivé App for on-island dining reservations and cashback privileges.</li>
        <li>Providing responsive on-ground assistance and trip coordination via WhatsApp during your stay.</li>
      </ul>

      <h2>3. Zero Spam &amp; Data Sharing Policy</h2>
      <p>
        We do not sell, rent, or trade your personal information to third-party telemarketers or external advertising networks. We only disclose
        essential booking data to vetted on-ground partners (licensed Mauritius transport chauffeurs, verified hotels, and certified excursion
        providers) solely to execute your confirmed travel itinerary.
      </p>

      <h2>4. Data Retention &amp; Security</h2>
      <p>
        We implement industry-standard encryption and operational safeguards to protect your personal details. Trip planning correspondence is
        retained only as long as necessary to fulfill your trip, maintain legal compliance, and resolve post-travel queries.
      </p>

      <h2>5. Your Rights &amp; Erasure Requests</h2>
      <p>
        You have the right to inspect, update, or request the immediate deletion of your personal data at any time. To exercise your rights,
        contact our privacy compliance team at <strong>concierge@passprive.travel</strong> or write to{" "}
        <strong>Passprive Platforms Private Ltd</strong>. Deletion requests are processed within 48 hours.
      </p>
    </LegalShell>
  );
}
