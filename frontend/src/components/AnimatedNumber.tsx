import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  duration?: number; // ms
  className?: string;
  format?: (n: number) => string;
}

// Counts up from 0 (or from the previous value) to `value` using an
// ease-out cubic so the final digits feel weighty. Cheap — runs on rAF
// and stops as soon as the target is reached.
export function AnimatedNumber({
  value,
  duration = 900,
  className,
  format = (n) => n.toLocaleString(),
}: Props) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    fromRef.current = display;
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const t = Math.min(1, (ts - startRef.current) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = fromRef.current + (value - fromRef.current) * eased;
      setDisplay(cur);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span className={className}>{format(Math.round(display))}</span>;
}
