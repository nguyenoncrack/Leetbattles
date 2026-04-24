export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#0f0f14" />
      <path
        d="M18 22 L10 32 L18 42"
        stroke="url(#logo-g)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M46 22 L54 32 L46 42"
        stroke="url(#logo-g)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38 16 L26 48"
        stroke="url(#logo-g)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WordMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`bg-gradient-to-r from-brand-400 via-white to-accent-cyan bg-clip-text text-transparent font-extrabold tracking-tight ${className}`}
    >
      CodeClash
    </span>
  );
}
