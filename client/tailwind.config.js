/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Brand-neutral, minimal palette
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F8F8F8",
          tertiary: "#F2F2F2",
        },
        border: {
          DEFAULT: "#E5E5E5",
          strong: "#D4D4D4",
        },
        text: {
          primary: "#111111",
          secondary: "#555555",
          muted: "#888888",
          disabled: "#BBBBBB",
        },
        accent: {
          DEFAULT: "#111111",
          hover: "#333333",
        },
        success: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
        },
        warning: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
        },
        info: {
          DEFAULT: "#2563EB",
          light: "#DBEAFE",
        },
        // Category colors (for charts)
        cat: {
          material: "#3B82F6",
          labour: "#10B981",
          equipment: "#F59E0B",
          transport: "#8B5CF6",
          misc: "#6B7280",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
        card: "0 2px 8px 0 rgba(0,0,0,0.06)",
        modal: "0 20px 60px -10px rgba(0,0,0,0.18)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        scaleIn: { from: { opacity: 0, transform: "scale(0.97)" }, to: { opacity: 1, transform: "scale(1)" } },
      },
    },
  },
  plugins: [],
};
