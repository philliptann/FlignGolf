// src/features/rounds/components/TeeSetBadge.tsx
import { Text, View } from "react-native";

interface Props {
  teeSetName: string;
  teeSetColour?: string | null;
}

function getTeeColours(colour?: string | null) {
  const value = (colour || "").trim().toLowerCase();

  switch (value) {
    case "white":
      return {
        backgroundColor: "#ffffff",
        borderColor: "#d1d5db",
        textColor: "#111827",
      };
    case "yellow":
      return {
        backgroundColor: "#facc15",
        borderColor: "#eab308",
        textColor: "#111827",
      };
    case "red":
      return {
        backgroundColor: "#dc2626",
        borderColor: "#b91c1c",
        textColor: "#ffffff",
      };
    case "blue":
      return {
        backgroundColor: "#2563eb",
        borderColor: "#1d4ed8",
        textColor: "#ffffff",
      };
    case "black":
      return {
        backgroundColor: "#111827",
        borderColor: "#000000",
        textColor: "#ffffff",
      };
    case "green":
      return {
        backgroundColor: "#16a34a",
        borderColor: "#15803d",
        textColor: "#ffffff",
      };
    default:
      return {
        backgroundColor: "#e5e7eb",
        borderColor: "#d1d5db",
        textColor: "#111827",
      };
  }
}

export default function TeeSetBadge({ teeSetName, teeSetColour }: Props) {
  const colours = getTeeColours(teeSetColour);

  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        backgroundColor: colours.backgroundColor,
        borderColor: colours.borderColor,
      }}
    >
      <Text style={{ fontWeight: "700", color: colours.textColor }}>
        {teeSetName}
      </Text>
    </View>
  );
}