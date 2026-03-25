import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#1a1a2e",
        card: "#16213e",
        "card-hover": "#1e2d4f",
        amber: {
          DEFAULT: "#d4a034",
          light: "#e8b94a",
        },
        gold: "#f0c040",
        cream: "#f5f0e1",
        primary: "#f5f0e1",
        secondary: "#a0a8b8",
        muted: "#6b7280",
      },
    },
  },
  plugins: [],
};
export default config;
