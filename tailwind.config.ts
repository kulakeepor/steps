import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        display: ["var(--font-space)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Gamified theme colors
        electric: {
          50: "#e5fbff",
          100: "#b3f0ff",
          200: "#80e5ff",
          300: "#4dd9ff",
          400: "#1aceff",
          500: "#00d4ff",
          600: "#00a8cc",
          700: "#007c99",
          800: "#005166",
          900: "#002633",
        },
        sunset: {
          50: "#fff5ed",
          100: "#ffe5d0",
          200: "#ffd4b3",
          300: "#ffc495",
          400: "#ffb378",
          500: "#ff6b35",
          600: "#cc5529",
          700: "#993f1e",
          800: "#662912",
          900: "#331409",
        },
        cosmos: {
          50: "#f5f0ff",
          100: "#e5d0ff",
          200: "#d5b0ff",
          300: "#c490ff",
          400: "#b470ff",
          500: "#a350ff",
          600: "#8240cc",
          700: "#613099",
          800: "#402066",
          900: "#201033",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-grid": "linear-gradient(to right, rgba(0, 212, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 212, 255, 0.05) 1px, transparent 1px)",
        "cosmos-gradient": "linear-gradient(135deg, #1A0B2E 0%, #2D1B4E 50%, #1A0B2E 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(163, 80, 255, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)",
      },
      backgroundSize: {
        "grid-4": "4rem 4rem",
      },
      animation: {
        "float": "float 3s ease-in-out infinite",
        "float-delayed": "float 3s ease-in-out 1.5s infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "shimmer": "shimmer 2s infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "bounce-subtle": "bounce-subtle 0.5s ease-out",
        "coin-fly": "coin-fly 0.6s ease-out forwards",
        "confetti": "confetti 1s ease-out forwards",
        "tilt": "tilt 0.3s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "slide-in": {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(163, 80, 255, 0.2)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(163, 80, 255, 0.4)",
          },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-25%)" },
        },
        "coin-fly": {
          "0%": {
            transform: "translateY(-20px) scale(0.5)",
            opacity: "0",
          },
          "50%": {
            transform: "translateY(5px) scale(1.1)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(0) scale(1)",
            opacity: "1",
          },
        },
        confetti: {
          "0%": {
            transform: "translateY(0) rotate(0deg)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(100px) rotate(720deg)",
            opacity: "0",
          },
        },
        tilt: {
          "0%": { transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)" },
          "100%": { transform: "perspective(1000px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y))" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
