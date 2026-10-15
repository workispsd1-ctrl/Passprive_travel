import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const stroke = (size: number, strokeWidth: string | number = 2.2) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
});

export const ShieldIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...stroke(size)} {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const StarIcon = ({ size = 18, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const CardIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...stroke(size)} {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

export const CheckIcon = ({ size = 11, ...p }: IconProps) => (
  <svg {...stroke(size, 3)} {...p}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const ChatIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...stroke(size)} {...p}>
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
);

export const HomeIcon = ({ size = 14, ...p }: IconProps) => (
  <svg {...stroke(size)} {...p}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const PlaneIcon = ({ size = 14, ...p }: IconProps) => (
  <svg {...stroke(size)} {...p}>
    <path d="M22 2L11 13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const CompassIcon = ({ size = 14, ...p }: IconProps) => (
  <svg {...stroke(size)} {...p}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

export const TruckIcon = ({ size = 14, ...p }: IconProps) => (
  <svg {...stroke(size)} {...p}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

export const PhoneIcon = ({ size = 14, ...p }: IconProps) => (
  <svg {...stroke(size)} {...p}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

export const UserIcon = ({ size = 15, ...p }: IconProps) => (
  <svg {...stroke(size)} {...p}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
