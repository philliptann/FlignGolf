// src/styles/contentStyles.ts

import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const contentStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.background,
  },

  screenCenter: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: colors.background,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    color:colors.title,
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: colors.title,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color:colors.title,
  },

  body: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.body,
  },

  muted: {
    fontSize: 14,
    color:colors.muted,
  },

  error: {
    color: colors.danger,
    fontSize: 16,
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.background,
    color:colors.title,
  },

  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  primaryButton: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: colors.buttonText,
    textAlign: "center",
    fontWeight: "600",
  },

  secondaryButton: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: colors.buttonText,
    textAlign: "center",
    fontWeight: "600",
  },

  outlineButton: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  outlineButtonText: {
    color: colors.primary,
    textAlign: "center",
    fontWeight: "600",
  },

  primaryButtonDisabled: {
    backgroundColor: colors.buttonDisabled,
  },

  secondaryButtonDisabled: {
    backgroundColor: colors.buttonDisabled,
  },

  outlineButtonDisabled: {
    borderColor:colors.buttonOutlineDisabled,
  },

  link: {
    color: colors.primary,
    fontWeight: "600",
  },

  linkCenter: {
    alignItems: "center",
    marginTop: 16,
  },

  loading: {
    marginTop: 32,
  },

  logoutContainer: {
    alignSelf: "flex-end",
    marginTop: 26,
    marginBottom: 12,
  },

  logoutText: {
    color:colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },

  smallButton: {
  alignSelf: "flex-start",
  marginTop: 4,
  paddingVertical: 10,
  paddingHorizontal: 12,
},
removeButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderRadius: 999,
  },
  removeButtonText: {
    color: colors.danger,
    fontWeight: "600",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  optionButtonActive: {
    backgroundColor: colors.secondary,
  },
  optionButtonText: {
    color: colors.text,
    fontWeight: "600",
  },
  optionButtonTextActive: {
    color:colors.dangerText,
  },

  
  tournamentModeButton: {
  flex: 1,
  paddingVertical: 10,
  borderRadius: 999,
  borderWidth: 1,
  alignItems: "center",
  backgroundColor: colors.background,
  borderColor: colors.border,
},
tournamentModeButtonActive: {
  backgroundColor:colors.secondary,
  borderColor:colors.secondary,
},
tournamentModeButtonText: {
  fontWeight: "600",
  color: colors.text,
},
tournamentModeButtonTextActive: {
  color: colors.buttonText,
},


filterPill: {
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 999,
  marginRight: 8,
  alignSelf: "flex-start",
  backgroundColor: colors.background,
},
filterPillActive: {
  backgroundColor: colors.secondary,
},
filterPillText: {
  color: colors.fillterPillText,
  fontWeight: "600",
},
filterPillTextActive: {
  color: colors.fillterPillTextInactive,
},
});