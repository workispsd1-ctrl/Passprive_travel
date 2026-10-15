import type { Metadata } from "next";

import { LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = { title: "Travel Disclaimer | PassPrivé Travel" };

export default function DisclaimerPage() {
  return (
    <LegalShell
      kicker="Important travel information"
      title="Travel & Platform Disclaimer"
      notice={
        <>
          This Travel &amp; Platform Disclaimer applies to all services, itineraries, recommendations, and digital applications offered by{" "}
          <strong>Passprive Platforms Private Ltd</strong> (&quot;PassPrivé&quot;).
        </>
      }
    >
      <h2>1. General Travel Advisory</h2>
      <p>
        PassPrivé Travel acts as an itinerary designer and trip coordinator connecting travelers with vetted third-party service providers
        (including hotels, private transport chauffeurs, catamaran operators, and activity centers in Mauritius). While we handpick and periodically
        audit all partners for high service standards, <strong>Passprive Platforms Private Ltd</strong> does not directly operate resorts, marine
        vessels, or wildlife parks.
      </p>

      <h2>2. Third-Party Excursions &amp; Adventure Activities</h2>
      <p>
        Participation in outdoor and adventure activities—including but not limited to catamaran sailing, marine reserve snorkeling, scuba diving,
        quad biking, and wildlife encounters at Casela Nature Park—carries inherent travel risks. Travelers participate in these excursions
        voluntarily and agree to adhere to all safety guidelines and briefings provided by licensed local operators.
      </p>

      <h2>3. Weather &amp; Natural Disruption Disclaimer</h2>
      <p>
        Mauritius experiences tropical island weather patterns. Changes in wind, tides, sea conditions, or cyclonic warnings issued by the Mauritius
        Meteorological Services may occasionally affect maritime schedules or outdoor activities. PassPrivé Platforms Private Ltd is not liable for
        weather-related disruptions, but our on-ground concierge team will actively assist in rescheduling affected excursions or arranging
        alternative activities.
      </p>

      <h2>4. Travel Insurance Recommendation</h2>
      <p>
        We strongly recommend that all international travelers obtain comprehensive comprehensive travel and medical insurance prior to departing for
        Mauritius. Adequate travel insurance should cover medical emergencies, trip delays, baggage loss, and emergency trip interruptions.
      </p>

      <h2>5. Digital App Perks &amp; Partner Venues</h2>
      <p>
        Complimentary VIP access to the PassPrivé App provides access to priority table bookings and cashback incentives at partner restaurants,
        beach clubs, and spas. Cashback percentages, discounts, and seating availability are maintained and honored directly by participating
        merchants in Mauritius.
      </p>

      <h2>6. Contact Information</h2>
      <p>
        For inquiries or clarifications regarding our travel disclaimer, please contact us at <strong>concierge@passprive.travel</strong> or reach
        our support desk via WhatsApp.
      </p>
    </LegalShell>
  );
}
