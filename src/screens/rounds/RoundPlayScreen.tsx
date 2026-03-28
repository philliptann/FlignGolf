// src/screens/rounds/RoundPlayScreen.tsx

import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  cancelRound,
  completeRound,
  getRoundDetail,
  patchRoundHoleScore,
  startRound,
} from "../../api/roundsApi";
import { mapRoundDetailToPlayScreen, isRoundLocked } from "../../features/rounds/utils/roundMappers";
import { RoundDetail } from "../../types/round";
import RoundStatusBadge from "../../features/rounds/components/RoundStatusBadge";
import TeeSetBadge from "../../features/rounds/components/TeeSetBadge";

export default function RoundPlayScreen() {
  const route = useRoute<any>();
  const roundId = route.params?.roundId as number;

  const [round, setRound] = useState<RoundDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const loadRound = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRoundDetail(roundId);
      console.log("Round detail response:", JSON.stringify(data, null, 2));
      setRound(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load round.");
      console.log("Failed to load round:", error);

    } finally {
      setLoading(false);
    }
  }, [roundId]);

  useEffect(() => {
    loadRound();
  }, [loadRound]);

  const handleUpdateScore = async (holeScoreId: number, strokesValue: string) => {
    try {
      setSavingId(holeScoreId);

      const trimmed = strokesValue.trim();
      const parsed = trimmed === "" ? null : Number.parseInt(trimmed, 10);

      if (trimmed !== "" && Number.isNaN(parsed)) {
        Alert.alert("Validation", "Please enter a valid number.");
        return;
      }

      await patchRoundHoleScore(holeScoreId, { strokes: parsed });
      await loadRound();
    } catch (error) {
      Alert.alert("Error", "Failed to update score.");
    } finally {
      setSavingId(null);
    }
  };

  const handleLifecycleAction = async (action: "start" | "complete" | "cancel") => {
    if (!round) return;

    try {
      if (action === "start") await startRound(round.id);
      if (action === "complete") await completeRound(round.id);
      if (action === "cancel") await cancelRound(round.id);

      await loadRound();
    } catch (error) {
      Alert.alert("Error", `Failed to ${action} round.`);
    }
  };

  if (loading || !round) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const playRound = mapRoundDetailToPlayScreen(round);
  const locked = isRoundLocked(round.status);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>
          {playRound.name}
        </Text>

        <RoundStatusBadge status={round.status} />

        <Text style={{ marginTop: 12 }}>Course: {playRound.courseName}</Text>


        <View style={{ marginTop: 8, marginBottom: 4 }}>
        <Text style={{ marginBottom: 6 }}>Tee set</Text>
        <TeeSetBadge
          teeSetName={playRound.teeSetName}
          teeSetColour={round.course?.tee_set_colour ?? null}
        />
      </View>


        <Text>Date: {playRound.datePlayed}</Text>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 16, marginBottom: 20 }}>
          {round.status === "draft" && (
            <Pressable
              onPress={() => handleLifecycleAction("start")}
              style={{ backgroundColor: "#2563eb", padding: 10, borderRadius: 8 }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Start Round</Text>
            </Pressable>
          )}

          {round.status === "in_progress" && (
            <>
              <Pressable
                onPress={() => handleLifecycleAction("complete")}
                style={{ backgroundColor: "#16a34a", padding: 10, borderRadius: 8 }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Complete</Text>
              </Pressable>

              <Pressable
                onPress={() => handleLifecycleAction("cancel")}
                style={{ backgroundColor: "#dc2626", padding: 10, borderRadius: 8 }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Cancel</Text>
              </Pressable>
            </>
          )}
        </View>

        {locked && (
          <Text style={{ marginBottom: 16, color: "#991b1b", fontWeight: "600" }}>
            This round is locked and can no longer be edited.
          </Text>
        )}

        {playRound.holes.map((hole) => (
          <View
            key={hole.holeNumber}
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
              Hole {hole.holeNumber}
            </Text>

            {hole.playerScores.map((score) => (
              <View key={score.holeScoreId} style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: "600", marginBottom: 6 }}>{score.playerName}</Text>
                <Text style={{ marginBottom: 6 }}>Par: {score.par ?? "-"}</Text>

                <TextInput
                  defaultValue={score.strokes != null ? String(score.strokes) : ""}
                  editable={!locked && savingId !== score.holeScoreId}
                  keyboardType="number-pad"
                  placeholder="Strokes"
                  onEndEditing={(e) =>
                    handleUpdateScore(score.holeScoreId, e.nativeEvent.text)
                  }
                  style={{
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: locked ? "#f3f4f6" : "#fff",
                  }}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}