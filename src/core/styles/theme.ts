// Token de diseño centralizado.
// Importar desde aquí en todos los StyleSheet.create()
export const theme = {
  colors: {
    primary:     "#1B3A6B",
    primaryDark: "#142D54",
    accent:      "#2563EB",
    success:     "#059669",
    danger:      "#DC2626",
    warning:     "#D97706",
    bg:          "#F0F4FF",
    card:        "#FFFFFF",
    text:        "#0F172A",
    textMid:     "#334155",
    textMuted:   "#64748B",
    border:      "#CBD5E1",
    inputBg:     "#F8FAFC",
  },
  radius: {
    sm: 8, md: 12, lg: 16, xl: 20, full: 9999,
  },
  spacing: {
    xs:4, sm:8, md:16, lg:24, xl:32,
  },
  shadow: {
    card: {
      shadowColor: "#1B3A6B",
      shadowOpacity: 0.12,
      shadowRadius: 20,
      shadowOffset: { width:0, height:8 },
      elevation: 8,
    },
  },
};
