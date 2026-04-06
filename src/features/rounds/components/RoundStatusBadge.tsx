// src/features/rounds/components/RoundStatusBadge.tsx
import { Text, View } from "react-native";
import { RoundStatus } from "../../../types/round";
import { colors } from "../../../styles/colors";

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
      return { backgroundColor: colors.lightGray,textColor: colors.text,  };
    case "in_progress":
      return { backgroundColor: colors.secondary,textColor: colors.buttonText, };
    case "completed":
      return { backgroundColor: colors.primary, textColor:colors.buttonText, };
    case "cancelled":
      return { backgroundColor: colors.danger, textColor: colors.buttonText, };
    default:
      return { backgroundColor: colors.lightGray, textColor: colors.text, };
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
      <Text style={{ fontSize: 12, fontWeight: "600", color: style.textColor }}>
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}