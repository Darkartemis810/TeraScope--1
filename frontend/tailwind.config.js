/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vapor Clinic Palette
        void: "#0A0A14",     // Deep background
        plasma: "#7B61FF",   // Primary accent
        ghost: "#F0EFF4",    // Light text
        graphite: "#18181B", // Card surfaces
        alert: {
          red: "#FF3B30",
          orange: "#FF9500",
          yellow: "#FFCC00",
          green: "#34C759",
        }
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        drama: ['"Instrument Serif"', 'serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(123, 97, 255, 0.4)',
        'float': '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
