// src/features/rounds/components/RoundCard.tsx
import { Pressable, Text, View } from "react-native";
import { RoundListItem } from "../../../types/round";
import RoundStatusBadge from "./RoundStatusBadge";

interface Props {
  round: RoundListItem;
  onPress: () => void;
}

export default function RoundCard({ round, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
      }}
    >
      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 6 }}>
          {round.name}
        </Text>
        <RoundStatusBadge status={round.status} />
      </View>

      <Text style={{ fontSize: 14, marginBottom: 4 }}>
        Course: {round.course_name_snapshot}
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 4 }}>
        Tee set: {round.tee_set_name_snapshot}
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 4 }}>
        Date: {round.date_played}
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 4 }}>
        Players: {round.players_count}
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 4 }}>
        Holes completed: {round.holes_completed} / {round.total_holes}
      </Text>
      <Text style={{ fontSize: 14, fontWeight: "600" }}>
        Progress: {round.completion_percent}%
      </Text>
    </Pressable>
  );
}