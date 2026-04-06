// src/screens/rounds/RoundPlayScreen.tsx

import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
import { colors } from "../../styles/colors";

export default function RoundPlayScreen() {
  const route = useRoute<any>();
  const roundId = route.params?.roundId as number;

  const [round, setRound] = useState<RoundDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [draftScores, setDraftScores] = useState<Record<number, string>>({});

  

  const loadRound = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRoundDetail(roundId);
      //console.log("Round detail response:", JSON.stringify(data, null, 2));
      setRound(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load round.");
      //console.log("Failed to load round:", error);

    } finally {
      setLoading(false);
    }
  }, [roundId]);

  useEffect(() => {
    loadRound();
  }, [loadRound]);

  useEffect(() => {
    if (!round) return;

    const initialScores: Record<number, string> = {};
    const playRoundData = mapRoundDetailToPlayScreen(round);

    for (const hole of playRoundData.holes) {
      for (const score of hole.playerScores) {
        initialScores[score.holeScoreId] =
          score.strokes != null ? String(score.strokes) : "";
      }
    }

  setDraftScores(initialScores);
}, [round]);

  const handleAutoAdvanceIfReady = async () => {
    if (locked || !currentHole || isLastHole) return;

    try {
      if (!validateHoleScores()) return;

      await saveHoleScores();
      setCurrentHoleIndex((prev) => prev + 1);
      await loadRound();
    } catch (error) {
      console.log("handleAutoAdvanceIfReady error", error);
      Alert.alert("Error", "Failed to save scores for this hole.");
      setSavingId(null);
    }
  };
 
  const handleLifecycleAction = async (action: "start" | "complete" | "cancel") => {
    if (!round) return;

    const runAction = async () => {
      try {
        if (action === "start") {
          await startRound(round.id);
          setCurrentHoleIndex(0);
        }
        if (action === "complete") await completeRound(round.id);
        if (action === "cancel") await cancelRound(round.id);

        await loadRound();
      } catch (error) {
        Alert.alert("Error", `Failed to ${action} round.`);
      }
    };

    if (action === "complete") {
      Alert.alert(
        "Complete round",
        "Are you sure you want to complete this round?",
        [
          { text: "No", style: "cancel" },
          { text: "Yes", onPress: () => void runAction() },
        ]
      );
      return;
    }

    if (action === "cancel") {
      Alert.alert(
        "Cancel round",
        "Are you sure you want to cancel this round?",
        [
          { text: "No", style: "cancel" },
          { text: "Yes", style: "destructive", onPress: () => void runAction() },
        ]
      );
      return;
    }

    await runAction();
  };;

  const validateHoleScores = () => {
    if (!currentHole) return false;

    for (const score of currentHole.playerScores) {
      const value = (draftScores[score.holeScoreId] ?? "").trim();

      if (value === "") {
        Alert.alert("Validation", `Enter strokes for ${score.playerName}.`);
        return false;
      }

      const parsed = Number.parseInt(value, 10);

      if (Number.isNaN(parsed) || parsed < 1) {
        Alert.alert("Validation", `Enter a valid strokes value for ${score.playerName}.`);
        return false;
      }
    }

    return true;
  };


  const saveHoleScores = async () => {
    if (!currentHole) return;

    for (const score of currentHole.playerScores) {
      const value = (draftScores[score.holeScoreId] ?? "").trim();
      const parsed = Number.parseInt(value, 10);

      setSavingId(score.holeScoreId);
      await patchRoundHoleScore(score.holeScoreId, { strokes: parsed });
    }

    setSavingId(null);
  };

  const handleNextHole = async () => {
    if (locked) return;

    try {
      if (!validateHoleScores()) return;

      await saveHoleScores();

      if (!isLastHole) {
        setCurrentHoleIndex((prev) => prev + 1);
      }

      await loadRound();
    } catch (error) {
      console.log("handleNextHole error", error);
      Alert.alert("Error", "Failed to save scores for this hole.");
      setSavingId(null);
    }
  };

  const handlePreviousHole = () => {
    if (isFirstHole) return;
    setCurrentHoleIndex((prev) => prev - 1);
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
 
  const currentHole = playRound.holes[currentHoleIndex];
  const isFirstHole = currentHoleIndex === 0;
  const isLastHole = currentHoleIndex === playRound.holes.length - 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "700", flex: 1 }}>
            {playRound.name}
          </Text>

          {round.tournament?.join_code ? (
            <View
              style={{
                backgroundColor: colors.background ,
                borderWidth: 1,
                borderColor: "#93c5fd",
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: "#1d4ed8", fontWeight: "700" }}>
                {round.tournament.join_code}
              </Text>
            </View>
          ) : null}
        </View>
  
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
    
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            marginTop: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 10 }}>
            Players
          </Text>

          {playRound.players.map((player) => (
            <View
              key={player.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text>{player.name}</Text>
              <Text style={{ fontWeight: "600" }}>
                {round.scoring_format === "stableford"
                  ? `${player.totalPoints ?? 0} pts`
                  : `${player.totalScore ?? "-"}`
                }
              </Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 16, marginBottom: 20 }}>
          {round.status === "draft" && (
            <Pressable
              onPress={() => handleLifecycleAction("start")}
              style={{ backgroundColor: "#1F6F4A", padding: 10, borderRadius: 8 }}
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

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 4 }}>
            Hole {currentHole.holeNumber}
          </Text>

          <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>
            Par {currentHole.playerScores[0]?.par ?? "-"}
            {currentHole.yardage != null ? ` • ${currentHole.yardage} yds` : ""}
          </Text>

          {currentHole.playerScores.map((score, index) => {
            const isLastPlayer = index === currentHole.playerScores.length - 1;

            return (
          
            <View
              key={score.holeScoreId}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600" }}>{score.playerName}</Text>
              </View>

              <TextInput
                value={draftScores[score.holeScoreId] ?? ""}
                editable={!locked && savingId !== score.holeScoreId}
                keyboardType="number-pad"
                placeholder="-"
                onChangeText={(text) =>
                  setDraftScores((prev) => ({
                    ...prev,
                    [score.holeScoreId]: text,
                  }))
                }
                onEndEditing={async () => {
                  if (isLastPlayer) {
                    await handleAutoAdvanceIfReady();
                  }
                }}
                style={{
                  width: 72,
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  textAlign: "center",
                  backgroundColor: locked ? "#f3f4f6" : "#fff",
                  fontWeight: "600",
                }}
              />
            </View>
          );})}

        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 24 }}>
          <Pressable
            onPress={handlePreviousHole}
            disabled={isFirstHole || locked}
            style={{
              backgroundColor: isFirstHole || locked ? "#d1d5db" : "#374151",
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Back</Text>
          </Pressable>

          <Pressable
            onPress={handleNextHole}
            disabled={locked}
            style={{
              backgroundColor: locked ? "#d1d5db" : "#1F6F4A",
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {isLastHole ? "Save Hole" : "Next"}
            </Text>
          </Pressable>
        </View>
          


      </ScrollView>
    </SafeAreaView>
  );
}