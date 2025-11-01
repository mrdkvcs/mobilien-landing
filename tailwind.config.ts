import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#007AAD",
          foreground: "#FFFBFC",
        },
        secondary: {
          DEFAULT: "#D9E2E9",
          foreground: "#0C1D32",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse": {
          from: { opacity: "0.5", transform: "scale(1)" },
          to: { opacity: "0.8", transform: "scale(1.1)" },
        },
        "flow": {
          "0%": { transform: "rotate(0deg) translateX(0px) translateY(0px)" },
          "33%": { transform: "rotate(120deg) translateX(50px) translateY(-30px)" },
          "66%": { transform: "rotate(240deg) translateX(-20px) translateY(40px)" },
          "100%": { transform: "rotate(360deg) translateX(0px) translateY(0px)" },
        },
        "flow-reverse": {
          "0%": { transform: "rotate(0deg) translateX(0px) translateY(0px)" },
          "33%": { transform: "rotate(-120deg) translateX(-40px) translateY(20px)" },
          "66%": { transform: "rotate(-240deg) translateX(30px) translateY(-50px)" },
          "100%": { transform: "rotate(-360deg) translateX(0px) translateY(0px)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-20px) scale(1.05)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse": "pulse 8s ease-in-out infinite alternate",
        "flow": "flow 12s ease-in-out infinite",
        "flow-reverse": "flow-reverse 15s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config

export default config

