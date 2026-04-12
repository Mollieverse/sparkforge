import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cyan:    "#00E5C0",
          violet:  "#7B2CBF",
          magenta: "#FF4D94",
          base:    "#0A0A1F",
          surface: "#0F0F2E",
          card:    "#13132E",
          border:  "#1E1E45",
          muted:   "#3A3A6A",
          text:    "#E8E8FF",
          sub:     "#8888BB",
        },
      },
      fontFamily: {
        grotesk: ["Space Grotesk", "sans-serif"],
        body:    ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "brand-grad":  "linear-gradient(135deg, #00E5C0 0%, #7B2CBF 60%, #FF4D94 100%)",
        "brand-grad2": "linear-gradient(90deg,  #00E5C0 0%, #7B2CBF 100%)",
      },
      keyframes: {
        "slide-in":  { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fade-in":   { from: { opacity: "0" }, to: { opacity: "1" } },
        "pulse-dot": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.3" } },
        float:       { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-5px)" } },
        shimmer:     { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "glow-pulse":{ "0%,100%": { boxShadow: "0 0 8px #00E5C044" }, "50%": { boxShadow: "0 0 20px #00E5C088" } },
      },
      animation: {
        "slide-in":  "slide-in 0.25s ease",
        "fade-in":   "fade-in 0.2s ease",
        "pulse-dot": "pulse-dot 2s ease infinite",
        float:       "float 3s ease-in-out infinite",
        shimmer:     "shimmer 2s linear infinite",
        "glow-pulse":"glow-pulse 2s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
