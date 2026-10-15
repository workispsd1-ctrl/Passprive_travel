import type { Metadata } from "next";

import { Hero } from "@/components/home/hero";
import { SiteNav } from "@/components/home/site-nav";
import { AppPromo, Faq, HowItWorks, Reviews, SiteFooter } from "@/components/home/static-sections";
import { TripModal } from "@/components/home/trip-modal";
import { TripPlannerProvider } from "@/components/home/trip-planner";
import { TripsSection } from "@/components/home/trips-section";
import { TrustStrip } from "@/components/home/trust-strip";
import { FinalCta, FloatingWhatsApp } from "@/components/home/whatsapp-ctas";

export const metadata: Metadata = {
  title: "PassPrivé Travel — Custom Mauritius Trips",
  description:
    "Handcrafted Mauritius trips for couples, families, and friends. Boutique stays, private chauffeurs, lagoon excursions, and free PassPrivé VIP App included.",
};

export default function HomePage() {
  return (
    <TripPlannerProvider>
      <SiteNav />
      <Hero />
      <TrustStrip />
      <TripsSection />
      <HowItWorks />
      <AppPromo />
      <Reviews />
      <Faq />
      <FinalCta />
      <SiteFooter />
      <FloatingWhatsApp />
      <TripModal />
    </TripPlannerProvider>
  );
}
