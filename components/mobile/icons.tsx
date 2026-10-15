// Inline icons used by the mobile experience (stroke icons follow the Heroicons v1 outline set).

const outline = (d: string, className: string, strokeWidth = "2") => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d={d} />
  </svg>
);

export const ChevronDownIcon = ({ className = "" }) => outline("M19 9l-7 7-7-7", className, "2.5");
export const MenuIcon = ({ className = "" }) => outline("M4 6h16M4 12h16M4 18h16", className);
export const UserIcon = ({ className = "" }) =>
  outline("M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", className);
export const TicketIcon = ({ className = "" }) =>
  outline(
    "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z",
    className,
  );
export const AdjustmentsIcon = ({ className = "" }) =>
  outline(
    "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    className,
  );
export const CubeIcon = ({ className = "" }) => outline("M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", className);
export const ArrowRightIcon = ({ className = "" }) => outline("M14 5l7 7m0 0l-7 7m7-7H3", className);

export const WhatsAppIcon = ({ className = "" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.584 1.761.815 2.791.815 3.188 0 5.776-2.587 5.776-5.768 0-3.18-2.587-5.766-5.776-5.766zm8.825 5.765c0 4.887-3.971 8.857-8.856 8.857-1.572 0-2.85-.36-4.088-.999l-4.707 1.233 1.258-4.593c-.767-1.309-1.221-2.736-1.221-4.498 0-4.886 3.972-8.857 8.858-8.857 4.884 0 8.756 3.971 8.756 8.857z" />
  </svg>
);
