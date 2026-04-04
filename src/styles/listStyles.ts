// src/styles/listStyles.ts
import { StyleSheet } from "react-native";

export const listStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  searchInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  list: {
    padding: 16,
    paddingBottom: 32,
  },

  card: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
  },

  empty: {
    textAlign: "center",
    marginTop: 32,
    color: "#666",
  },

  separator: {
    height: 12,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },
});
