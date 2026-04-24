// Custom icon set — hand-crafted SVG components used across CodeClash.
// Every icon is a 24×24 viewBox, inherits color via currentColor, and supports
// `size` (px) + `className` + optional `gradient` for premium surfaces.

import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  // If true, fills the icon with the brand→cyan gradient.
  gradient?: boolean;
}

const BRAND_GRAD_ID = "cc-brand-grad";
const FIRE_GRAD_ID = "cc-fire-grad";
const GOLD_GRAD_ID = "cc-gold-grad";
const SILVER_GRAD_ID = "cc-silver-grad";
const BRONZE_GRAD_ID = "cc-bronze-grad";

// Shared gradient definitions. Mount once at the App root so icons can
// reference them by ID without re-declaring.
export function IconGradientDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={BRAND_GRAD_ID} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={FIRE_GRAD_ID} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="60%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id={GOLD_GRAD_ID} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id={SILVER_GRAD_ID} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e5e7eb" />
          <stop offset="100%" stopColor="#6b7280" />
        </linearGradient>
        <linearGradient id={BRONZE_GRAD_ID} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SvgBase({
  size = 20,
  children,
  gradient,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={gradient ? `url(#${BRAND_GRAD_ID})` : "currentColor"}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {children}
    </svg>
  );
}

// ---------- NAV ICONS (outline-friendly, 1.8px stroke) ----------

function StrokeIcon({
  size = 20,
  children,
  className,
  strokeWidth = 1.8,
  ...rest
}: IconProps & { children: React.ReactNode; strokeWidth?: number | string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </StrokeIcon>
  );
}

export function IconTrophy({ gradient, ...rest }: IconProps) {
  return (
    <SvgBase gradient={gradient} {...rest}>
      <path d="M7 4h10a1 1 0 0 1 1 1v2h2.5a1.5 1.5 0 0 1 1.5 1.5V10a4 4 0 0 1-4 4h-.3a6 6 0 0 1-4.7 4.9V20h3a1 1 0 0 1 1 1v1H7v-1a1 1 0 0 1 1-1h3v-1.1A6 6 0 0 1 6.3 14H6a4 4 0 0 1-4-4V8.5A1.5 1.5 0 0 1 3.5 7H6V5a1 1 0 0 1 1-1Zm-1 5H4v1a2 2 0 0 0 2 2V9Zm12 3a2 2 0 0 0 2-2V9h-2v3Z" />
    </SvgBase>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5" />
      <circle cx="17" cy="7.5" r="2.8" />
      <path d="M14.5 14.8c.8-.4 1.7-.6 2.5-.6 2.4 0 4.4 1.6 5 4.2" />
    </StrokeIcon>
  );
}

export function IconTarget(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </StrokeIcon>
  );
}

export function IconPulse(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M2.5 12h4l2-6 4 12 2-6h3" />
      <circle cx="19.5" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </StrokeIcon>
  );
}

// ---------- STAT / CHIP ICONS ----------

export function IconFlame({ size = 20, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={`url(#${FIRE_GRAD_ID})`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path d="M12 2c.8 2.6-.2 4.3-1.6 5.9-1.7 2-3.4 3.9-3.4 6.5A7 7 0 0 0 14 21a7 7 0 0 0 7-7c0-2.6-1.5-4.4-3-6-1.4-1.5-2.8-3-2.6-5.3-1.2 1-1.9 2.6-1.7 4.4.1 1-.6 1.5-1.3 1-1.7-1.1-1.1-3.5-.4-6.1Z" />
      <path
        d="M12.5 13c.4 1.2-.1 2-.7 2.7-.8.8-1.6 1.6-1.6 3A2.8 2.8 0 0 0 13 21.5 2.8 2.8 0 0 0 15.8 18c-.2-1.3-.9-2-1.6-2.8-.6-.7-1.1-1.4-.9-2.5-.6.5-.8 1.2-.7 2 .1.5-.3.7-.6.5-.8-.5-.6-1.6-.4-2.7Z"
        fill="#fff7ed"
        opacity="0.55"
      />
    </svg>
  );
}

export function IconBolt({ gradient, ...rest }: IconProps) {
  return (
    <SvgBase gradient={gradient} {...rest}>
      <path d="M13.5 2 4 13.2a.8.8 0 0 0 .6 1.3H10l-1.5 7.5a.6.6 0 0 0 1.1.4L20 10.8a.8.8 0 0 0-.6-1.3H14l1.5-7.5a.6.6 0 0 0-1-.4Z" />
    </SvgBase>
  );
}

export function IconStar({ gradient, ...rest }: IconProps) {
  return (
    <SvgBase gradient={gradient} {...rest}>
      <path d="M12 2.5l2.9 5.9 6.6 1-4.8 4.6 1.1 6.5L12 17.5l-5.8 3 1.1-6.5-4.8-4.6 6.6-1L12 2.5Z" />
    </SvgBase>
  );
}

// ---------- LANDING / FEATURE ICONS ----------

export function IconSwords({ gradient, ...rest }: IconProps) {
  return (
    <SvgBase gradient={gradient} {...rest}>
      {/* Two crossed swords */}
      <path d="M6.5 3 3 6.5l9.5 9.5 1.8-1.8L6.5 3Z" />
      <path d="M17.5 3 14 6.5l-1.8 1.8 5.5 5.5L21 10.2 17.5 3Z" opacity=".7" />
      <path d="m2.5 15.8 2 2 2 2-2.5.9L2 19.3l.5-3.5Z" />
      <path d="m17.5 17.8 2-2 2-2 .5 3.5-2 1.4-2.5-.9Z" opacity=".7" />
    </SvgBase>
  );
}

export function IconShield({ gradient, ...rest }: IconProps) {
  return (
    <SvgBase gradient={gradient} {...rest}>
      <path d="M12 2 4 5v6c0 4.8 3.4 9.2 8 11 4.6-1.8 8-6.2 8-11V5l-8-3Z" />
    </SvgBase>
  );
}

// ---------- BADGE ICONS (one per seeded badge) ----------

export function IconDrop({ gradient, ...rest }: IconProps) {
  return (
    <SvgBase gradient={gradient} {...rest}>
      <path d="M12 2.5s-6 7-6 11.5a6 6 0 1 0 12 0C18 9.5 12 2.5 12 2.5Z" />
      <path
        d="M10.5 15a3 3 0 0 0 2.5 3.5c-.4-1.1-.1-1.9.5-2.6.6-.8.5-1.6.1-2.3-.1.8-.7 1.3-1.4 1.4-.7.1-1.5-.1-1.7 0Z"
        fill="#fff"
        opacity=".45"
      />
    </SvgBase>
  );
}

export function IconGear({ gradient, ...rest }: IconProps) {
  return (
    <SvgBase gradient={gradient} {...rest}>
      <path d="M12 2.2c.3 0 .6.2.6.5l.2 1.7a8 8 0 0 1 2 .8l1.3-1.2a.6.6 0 0 1 .8 0l1.1 1.1c.2.2.2.6 0 .8L17 7.2a8 8 0 0 1 .8 2l1.7.2a.6.6 0 0 1 .5.6v1.6c0 .3-.2.5-.5.6l-1.7.2a8 8 0 0 1-.8 2l1.2 1.3c.2.2.2.6 0 .8l-1.1 1.1a.6.6 0 0 1-.8 0L15 16.8a8 8 0 0 1-2 .8l-.2 1.7a.6.6 0 0 1-.6.5h-1.6a.6.6 0 0 1-.6-.5l-.2-1.7a8 8 0 0 1-2-.8l-1.3 1.2a.6.6 0 0 1-.8 0l-1.1-1.1a.6.6 0 0 1 0-.8L5.2 15a8 8 0 0 1-.8-2l-1.7-.2a.6.6 0 0 1-.5-.6v-1.6c0-.3.2-.5.5-.6L4.4 10a8 8 0 0 1 .8-2L4 6.8a.6.6 0 0 1 0-.8l1.1-1.1c.2-.2.6-.2.8 0L7.2 6c.6-.3 1.3-.6 2-.8L9.4 3.5c0-.3.3-.5.6-.5H12Zm0 6a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
    </SvgBase>
  );
}

export function IconSkull({ gradient, ...rest }: IconProps) {
  return (
    <SvgBase gradient={gradient} {...rest}>
      <path d="M12 2.5a8 8 0 0 0-8 8.3c0 2.5 1 4.4 2.4 5.8.6.6.9 1 .9 1.8v2.1c0 .5.4 1 1 1h2v-1.7c0-.3.3-.6.7-.6h1.9v2.3h2v-2.3h2c.3 0 .6.3.6.6V21.5h2a1 1 0 0 0 1-1v-2.1c0-.8.3-1.2.9-1.8C19 15.2 20 13.3 20 10.8A8 8 0 0 0 12 2.5Zm-3 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm6 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm-4.5 3.3h3l-1.5 2-1.5-2Z" />
    </SvgBase>
  );
}

// ---------- UTILITY ICONS ----------

export function IconCheck(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={2.4} {...props}>
      <path d="M4.5 12.5 10 18l9.5-11" />
    </StrokeIcon>
  );
}

export function IconCheckCircle({ gradient, ...rest }: IconProps) {
  return (
    <SvgBase gradient={gradient} {...rest}>
      <circle cx="12" cy="12" r="10" />
      <path
        d="m7 12.5 3.2 3.3L17 9"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </SvgBase>
  );
}

export function IconArrowUp(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={2.2} {...props}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </StrokeIcon>
  );
}

export function IconChartUp(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={2} {...props}>
      <path d="M3.5 3.5v17h17" />
      <path d="m7 15 4-4 3 3 5-6" />
      <path d="M14 8h5v5" />
    </StrokeIcon>
  );
}

export function IconBrain(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M8.5 3.5a3 3 0 0 0-3 3c0 .5.1 1 .3 1.4A3.3 3.3 0 0 0 4 11a3.3 3.3 0 0 0 .8 2.2A3 3 0 0 0 4 15.5a3 3 0 0 0 4 2.8 3 3 0 0 0 3 2.2V3.5a3 3 0 0 0-2.5-1.5Z" />
      <path d="M15.5 3.5a3 3 0 0 1 3 3c0 .5-.1 1-.3 1.4A3.3 3.3 0 0 1 20 11a3.3 3.3 0 0 1-.8 2.2 3 3 0 0 1 .8 2.3 3 3 0 0 1-4 2.8 3 3 0 0 1-3 2.2V3.5a3 3 0 0 1 2.5-1.5Z" />
    </StrokeIcon>
  );
}

export function IconPlug(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M9 3v4M15 3v4" />
      <path d="M6 7h12v4a6 6 0 0 1-12 0V7Z" />
      <path d="M12 17v4" />
    </StrokeIcon>
  );
}

export function IconSparkle({ gradient, ...rest }: IconProps) {
  return (
    <SvgBase gradient={gradient} {...rest}>
      <path d="M12 2 13.8 9 21 10.8 13.8 12.6 12 19.5l-1.8-6.9L3 10.8l7.2-1.8L12 2Z" />
      <path d="M5 3 5.6 5 7.5 5.5 5.6 6 5 8l-.6-2L2.5 5.5 4.4 5 5 3Z" opacity=".6" />
      <path d="M19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" opacity=".6" />
    </SvgBase>
  );
}

export function IconGlobe(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </StrokeIcon>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18M8 3v4M16 3v4" />
      <circle cx="8.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </StrokeIcon>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={2.2} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </StrokeIcon>
  );
}

export function IconMegaphone(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 9.5v4h3l10 5V4.5l-10 5H4Z" />
      <path d="M7 13.5v3a2 2 0 0 0 4 0v-2" />
      <path d="M19 8.5a4 4 0 0 1 0 7" />
    </StrokeIcon>
  );
}

export function IconSpark({ gradient, ...rest }: IconProps) {
  return (
    <SvgBase gradient={gradient} {...rest}>
      <path d="M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8M18.4 5.6l-2.8 2.8m-7.2 7.2-2.8 2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.2" />
    </SvgBase>
  );
}

// ---------- RANKS (podium) ----------

export function IconCrown({ tier = "gold", size = 20, ...rest }: IconProps & { tier?: "gold" | "silver" | "bronze" }) {
  const id =
    tier === "silver" ? SILVER_GRAD_ID : tier === "bronze" ? BRONZE_GRAD_ID : GOLD_GRAD_ID;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={`url(#${id})`}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path d="M3 7.5 6.5 13l3-6 2.5 5 2.5-5 3 6L21 7.5 20 17H4L3 7.5Z" />
      <path d="M4 18h16v2H4z" />
      <circle cx="3.5" cy="7" r="1.3" />
      <circle cx="20.5" cy="7" r="1.3" />
      <circle cx="12" cy="5" r="1.3" />
    </svg>
  );
}

export function IconMedal({ tier = "silver", size = 20, ...rest }: IconProps & { tier?: "gold" | "silver" | "bronze" }) {
  const id =
    tier === "gold" ? GOLD_GRAD_ID : tier === "bronze" ? BRONZE_GRAD_ID : SILVER_GRAD_ID;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={`url(#${id})`}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path d="M8 2h2l2 5-2 5H8L6 7l2-5Zm6 0h2l2 5-2 5h-2l-2-5 2-5Z" />
      <circle cx="12" cy="16" r="5.2" />
      <circle cx="12" cy="16" r="2.2" fill="#fff" opacity=".4" />
    </svg>
  );
}
