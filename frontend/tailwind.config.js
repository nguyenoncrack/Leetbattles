/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#8b5cf6",
          50: "#f5f3ff",
          100: "#ede9fe",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
        },
        ink: {
          950: "#07070b",
          900: "#0f0f14",
          800: "#141420",
          700: "#1c1c2b",
          600: "#272739",
          500: "#3b3b55",
        },
        accent: {
          green: "#34d399",
          amber: "#fbbf24",
          rose: "#fb7185",
          cyan: "#22d3ee",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139, 92, 246, 0.25), 0 8px 32px rgba(139,92,246,0.18)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 30% 20%, rgba(139,92,246,0.18), transparent 45%), radial-gradient(circle at 80% 80%, rgba(34,211,238,0.12), transparent 50%)",
        "grid-lines":
          "linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-40": "40px 40px",
      },
      animation: {
        shine: "shine 3s linear infinite",
        "aurora-a": "aurora-a 22s ease-in-out infinite",
        "aurora-b": "aurora-b 28s ease-in-out infinite",
        "aurora-c": "aurora-c 32s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        "float-slower": "float-slower 14s ease-in-out infinite",
        "grid-pulse": "grid-pulse 8s ease-in-out infinite",
        "spin-slow": "spin 28s linear infinite",
        "spin-slower": "spin 90s linear infinite",
        "pulse-ring": "pulse-ring 3s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        twinkle: "twinkle 4s ease-in-out infinite",
        "twinkle-slow": "twinkle 7s ease-in-out infinite",
        "star-drift": "star-drift 120s linear infinite",
        "star-drift-slow": "star-drift 220s linear infinite",
        shoot: "shoot 3.5s ease-in forwards",
        glitch: "glitch 2.4s infinite steps(1, end)",
      },
      keyframes: {
        shine: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "aurora-a": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(60px,-40px,0) scale(1.15)" },
        },
        "aurora-b": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(-80px,50px,0) scale(0.9)" },
        },
        "aurora-c": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1.05)" },
          "50%": { transform: "translate3d(40px,70px,0) scale(1.2)" },
        },
        "float-slow": {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-16px) rotate(3deg)" },
        },
        "float-slower": {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-24px) rotate(-4deg)" },
        },
        "grid-pulse": {
          "0%,100%": { opacity: "0.35" },
          "50%": { opacity: "0.7" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "80%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        twinkle: {
          "0%,100%": { opacity: "0.25", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.4)" },
        },
        "star-drift": {
          "0%": { transform: "translate3d(0,0,0)" },
          "100%": { transform: "translate3d(-600px,-300px,0)" },
        },
        shoot: {
          "0%": { transform: "translate3d(0,0,0) rotate(-18deg)", opacity: "0" },
          "8%": { opacity: "1" },
          "100%": {
            transform: "translate3d(120vw,60vh,0) rotate(-18deg)",
            opacity: "0",
          },
        },
        glitch: {
          "0%,92%,100%": {
            textShadow: "0 0 transparent",
            transform: "translate(0,0)",
            filter: "none",
          },
          "93%": {
            transform: "translate(-1px,1px)",
            filter: "drop-shadow(1px 0 0 #ff003c) drop-shadow(-1px 0 0 #00eaff)",
          },
          "95%": {
            transform: "translate(1px,-1px)",
            filter: "drop-shadow(-1px 0 0 #ff003c) drop-shadow(1px 0 0 #00eaff)",
          },
          "97%": {
            transform: "translate(0,0)",
            filter: "drop-shadow(2px 0 0 #ff003c) drop-shadow(-2px 0 0 #00eaff)",
          },
        },
      },
    },
  },
  plugins: [],
};
