// src/features/rounds/components/RoundStatusBadge.tsx
import { Text, View } from "react-native";
import { RoundStatus } from "../../../types/round";

interface Props {
  status: RoundStatus;
}

function getStatusLabel(status: RoundStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

function getStatusStyle(status: RoundStatus) {
  switch (status) {
    case "draft":
      return { backgroundColor: "#d1d5db", color: "#111827" };
    case "in_progress":
      return { backgroundColor: "#bfdbfe", color: "#1e3a8a" };
    case "completed":
      return { backgroundColor: "#bbf7d0", color: "#166534" };
    case "cancelled":
      return { backgroundColor: "#fecaca", color: "#991b1b" };
    default:
      return { backgroundColor: "#e5e7eb", color: "#111827" };
  }
}

export default function RoundStatusBadge({ status }: Props) {
  const style = getStatusStyle(status);

  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: style.backgroundColor,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "600", color: style.color }}>
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}