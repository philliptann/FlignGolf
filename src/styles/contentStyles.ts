// contentStyles.ts

import { StyleSheet } from "react-native";

export const contentStyles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },

  /** Page-level title (About, Course detail) */
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111",
  },

  /** Section heading (Rules list, sections) */
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111",
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#111",
  },

  body: {
    fontSize: 15,
    lineHeight: 24,
    color: "#333",
  },

  error: {
    color: "red",
    fontSize: 16,
    marginBottom: 12,
  },
  screenCenter: {
    flex: 1,
    justifyContent: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  primaryButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#0a7",
  },

  primaryButtonDisabled: {
    backgroundColor: "#999",
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  link: {
    color: "#0a7",
    fontWeight: "600",
  },
  linkCenter: {
    alignItems: "center",
    marginTop: 12,
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
    color: "#0a7",
    fontWeight: "600",
    fontSize: 14,
  },
});

