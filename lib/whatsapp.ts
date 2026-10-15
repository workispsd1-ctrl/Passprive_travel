export const WHATSAPP_NUMBER = "917838215147";
export const WA_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

export const waLink = (text: string) => `${WA_BASE}?text=${encodeURIComponent(text)}`;
