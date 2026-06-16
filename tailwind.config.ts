import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FFFDF8",
          100: "#FFF8F0",
          200: "#FFF0D9",
          300: "#FFE4BC",
          400: "#F5D5A0",
          500: "#E8C47A",
        },
        gold: {
          300: "#E8C97A",
          400: "#D4A843",
          500: "#C9A84C",
          600: "#A8892E",
          700: "#8B6E1A",
          800: "#6B5210",
        },
        herbal: {
          50: "#F0F7EC",
          100: "#D8EDCC",
          200: "#A8D48A",
          300: "#78B85A",
          400: "#4E9A30",
          500: "#2D6B14",
          600: "#1E5008",
          700: "#143A04",
        },
        saffron: {
          100: "#FFF3D6",
          200: "#FFE0A0",
          300: "#FFC947",
          400: "#F5A623",
          500: "#E08B00",
        },
        rose: {
          50: "#FFF5F5",
          100: "#FFE4E4",
          200: "#FFBFBF",
          300: "#FF9494",
          400: "#E87070",
          500: "#C94F4F",
          600: "#A83030",
        },
        earthy: {
          100: "#F5EDE0",
          200: "#E8D4BC",
          300: "#C4A882",
          400: "#A8845C",
          500: "#8B6340",
          600: "#6B4620",
          700: "#4A2E10",
        },
        bridal: {
          100: "#FFE4E4",
          200: "#FFC0C0",
          300: "#FF7A7A",
          400: "#E84040",
          500: "#C41A1A",
          600: "#9B0D0D",
          700: "#6B0000",
        },
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-in-right": "slideInRight 0.4s ease-out forwards",
        "shimmer": "shimmer 1.5s infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9A84C 0%, #E8C97A 50%, #C9A84C 100%)",
        "cream-gradient": "linear-gradient(180deg, #FFF8F0 0%, #FFF0D9 100%)",
        "herbal-gradient": "linear-gradient(135deg, #2D6B14 0%, #4E9A30 100%)",
      },
      boxShadow: {
        "gold": "0 4px 24px rgba(201, 168, 76, 0.25)",
        "gold-lg": "0 8px 40px rgba(201, 168, 76, 0.35)",
        "soft": "0 2px 16px rgba(0, 0, 0, 0.06)",
        "card": "0 4px 32px rgba(0, 0, 0, 0.08)",
        "product": "0 8px 48px rgba(0, 0, 0, 0.10)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
