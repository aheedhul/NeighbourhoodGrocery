import type { MantineThemeOverride } from "@mantine/core";

export const appTheme: MantineThemeOverride = {
  colors: {
    brand: [
      "#f3f5ff",
      "#e2e8ff",
      "#c7d2ff",
      "#9aa8ff",
      "#6d7bff",
      "#495cf9",
      "#3545d6",
      "#2b37a8",
      "#232f87",
      "#1c276c"
    ]
  },
  primaryColor: "brand",
  fontFamily: "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  headings: {
    fontFamily: "'Space Grotesk', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    sizes: {
      h1: { fontSize: "44px", lineHeight: "1.1" },
      h2: { fontSize: "34px", lineHeight: "1.15" },
      h3: { fontSize: "28px", lineHeight: "1.2" }
    }
  },
  defaultRadius: "lg",
  components: {
    Card: {
      styles: {
        root: {
          border: "1px solid rgba(67, 97, 238, 0.08)",
          boxShadow: "0 18px 36px -18px rgba(30, 41, 59, 0.25)"
        }
      }
    },
    Button: {
      styles: {
        root: {
          fontWeight: 600
        }
      }
    }
  }
};
