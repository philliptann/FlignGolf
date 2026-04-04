// src/screens/rounds/RoundCreateScreen.tsx
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenBackground from "../../components/ScreenBackground";
import { contentStyles as content } from "../../styles/contentStyles";
import { createRound } from "../../api/roundsApi";
import TeeSetBadge from "../../features/rounds/components/TeeSetBadge";
import { useAuth } from "../../auth/AuthContext";

import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";

import { createTournament, joinTournament } from "../../api/tournamentsApi";

const SCORING_FORMAT_OPTIONS = [
  { value: "stableford", label: "Stableford" },
  { value: "strokeplay", label: "Stroke Play" },
  { value: "matchplay", label: "Match Play" },
] as const;

type PlayerDraft = {
  display_name: string;
  user_id?: number;
  locked?: boolean;
};

export default function RoundCreateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();

  const {
    courseId,
    courseName,
    teeSetId = 1,
    teeSetName = "Default Tee",
    teeSetColour = null,
  } = route.params || {};

  const primaryDisplayName = useMemo(
    () =>
      user?.profile?.display_name ||
      user?.display_name ||
      user?.username ||
      "Player 1",
    [user]
  );

  const [name, setName] = useState(`${courseName || "Course"} Round`);
  const [datePlayed, setDatePlayed] = useState( new Date().toISOString().slice(0, 10) );
  const [scoringFormat, setScoringFormat] = useState< "stableford" | "strokeplay" | "matchplay" >("stableford");
  const [isQualifying, setIsQualifying] = useState(true);
  const [players, setPlayers] = useState<PlayerDraft[]>([ { display_name: primaryDisplayName, user_id: user?.id, locked: true, }, ]);
  const [saving, setSaving] = useState(false);

  const [isTournament, setIsTournament] = useState(false);
  const [tournamentMode, setTournamentMode] = useState<"create" | "join">("create");
  const [tournamentName, setTournamentName] = useState("");
  const [createdTournamentCode, setCreatedTournamentCode] = useState("");
  const [createdTournamentName, setCreatedTournamentName] = useState("");
  const [joinCode, setJoinCode] = useState("");


  const updatePlayer = (index: number, value: string) => {
    setPlayers((current) =>
      current.map((player, i) =>
        i === index ? { ...player, display_name: value } : player
      )
    );
  };

  const addPlayer = () => {
    setPlayers((current) => [
      ...current,
      { display_name: `Player ${current.length + 1}` },
    ]);
  };

  const removePlayer = (index: number) => {
    if (index === 0) return;
    setPlayers((current) => current.filter((_, i) => i !== index));
  };

  const handleShareTournamentCode = async (code: string) => {
    try {
      await Share.share({
        message: `Join my FlingGolf tournament using code: ${code}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to open share options.");
    }
  };

  const handleCopyTournamentCode = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert("Copied", `Tournament code ${code} copied to clipboard.`);
    } catch (error) {
      Alert.alert("Error", "Failed to copy tournament code.");
    }
  };


  const handleCreateRound = async () => {
    if (!courseId) {
      Alert.alert("Error", "Course is missing.");
      return;
    }

    const cleanedPlayers = players.map((player) => ({
      ...player,
      display_name: player.display_name.trim(),
    }));

    if (!isTournament) {
      if (cleanedPlayers.length === 0) {
        Alert.alert("Validation", "Please enter at least one player.");
        return;
      }

      if (cleanedPlayers.some((player) => !player.display_name)) {
        Alert.alert(
          "Validation",
          "Please complete all player names or remove empty rows."
        );
        return;
      }
    }

    if (isTournament && tournamentMode === "join" && !joinCode.trim()) {
      Alert.alert("Validation", "Please enter a tournament code.");
      return;
    }

    try {
      setSaving(true);

      if (isTournament) {
        if (tournamentMode === "create") {
          const response = await createTournament({
            name: tournamentName.trim() || name.trim() || "Tournament",
            course_id: Number(courseId),
            tee_set_id: Number(teeSetId),
            scoring_format: scoringFormat,
            date_played: datePlayed,
            is_qualifying: isQualifying,
          });

          setCreatedTournamentCode(response.tournament.join_code);
          setCreatedTournamentName(response.tournament.name);

          Alert.alert(
            "Tournament created", `Code: ${response.tournament.join_code}`,
            [
              { text: "Copy", onPress: () => void handleCopyTournamentCode(response.tournament.join_code), },
              { text: "Share", onPress: () => void handleShareTournamentCode(response.tournament.join_code), },
              { text: "OK", style: "cancel", },
            ]
          );

          navigation.replace("RoundPlay", { roundId: response.round_id });
          return;
        }

        if (tournamentMode === "join") {
          const response = await joinTournament({
            join_code: joinCode.trim().toLowerCase(),
          });

          navigation.replace("RoundPlay", { roundId: response.round_id });
          return;
        }
      }

      const payload = {
        name: name.trim(),
        course_id: Number(courseId),
        tee_set_id: Number(teeSetId),
        scoring_format: scoringFormat,
        date_played: datePlayed,
        is_qualifying: isQualifying,
        players: cleanedPlayers.map((player, index) => ({
          display_name: player.display_name,
          user_id: player.user_id,
          is_primary_player: index === 0,
        })),
      };

      const created = await createRound(payload);
      navigation.replace("RoundPlay", { roundId: created.id });
    } catch (err: any) {
        console.log("Failed to create round:", err);

        let message = "Failed to create round.";

        const raw =
          err?.response?.data ??
          err?.message ??
          err;

        if (typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw);
            message = parsed?.detail || raw;
          } catch {
            message = raw;
          }
        } else if (raw && typeof raw === "object") {
          message = raw.detail || raw.message || message;
        }

        Alert.alert("Error", message);
      }finally {
      setSaving(false);
    }
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={content.container}>
        <Text style={content.title}>Create Round</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Course</Text>
          <Text style={styles.infoValue}>{courseName || `Course #${courseId}`}</Text>

          <Text style={[styles.infoLabel, { marginTop: 10 }]}>Tee Set</Text>
          <View style={{ marginTop: 6 }}>
            <TeeSetBadge teeSetName={teeSetName} teeSetColour={teeSetColour} />
          </View>
        </View>

        <Text style={styles.label}>Round Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Round name"
        />

        <Text style={styles.label}>Date Played</Text>
        <TextInput
          value={datePlayed}
          onChangeText={setDatePlayed}
          style={styles.input}
          placeholder="YYYY-MM-DD"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Scoring Format</Text>
        <View style={content.optionRow}>
          {SCORING_FORMAT_OPTIONS.map((option) => {
            const active = scoringFormat === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setScoringFormat(option.value)}
                style={[content.optionButton, active && content.optionButtonActive]}
              >
                <Text
                  style={[
                    content.optionButtonText,
                    active && content.optionButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            marginTop: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
            Tournament
          </Text>

          <Pressable
            onPress={() => setIsTournament((prev) => !prev)}
            style={[
              content.tournamentModeButton,
              isTournament && content.tournamentModeButtonActive,
              { marginBottom: 12 },
            ]}
          >
            <Text
              style={[
                content.tournamentModeButtonText,
                isTournament && content.tournamentModeButtonTextActive,
                { marginBottom: 12 },
              ]}
            >
              {isTournament ? "✓ Tournament round" : "Tournament round"}
            </Text>
          </Pressable>

          {isTournament && (
            <>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                <Pressable
                  onPress={() => setTournamentMode("create")}
                  style={[content.tournamentModeButton,tournamentMode === "create" && content.tournamentModeButtonActive,]} >
                  <Text
                    style={{ fontWeight: "600", color: tournamentMode === "create" ? "#fff" : "#111827", }}  >
                    Create
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setTournamentMode("join")}
                  style={[content.tournamentModeButton,tournamentMode === "join" && content.tournamentModeButtonActive,]} >
                  <Text
                    style={{ fontWeight: "600", color: tournamentMode === "join" ? "#fff" : "#111827", }}  >
                    Join
                  </Text>
                </Pressable>
              </View>

              {tournamentMode === "create" ? (
                <View>
                  <Text style={{ marginBottom: 6, fontWeight: "600" }}>Tournament name</Text>
                  <TextInput
                    value={tournamentName}
                    onChangeText={setTournamentName}
                    placeholder="e.g. Beamish Sunday Open"
                    style={{
                      borderWidth: 1,
                      borderColor: "#d1d5db",
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      backgroundColor: "#fff",
                    }}
                  />
                </View>
              ) : (
                <View>
                  <Text style={{ marginBottom: 6, fontWeight: "600" }}>Join code</Text>
                  <TextInput
                    value={joinCode}
                    onChangeText={setJoinCode}
                    placeholder="Enter code"
                    autoCapitalize="none"
                    style={{
                      borderWidth: 1,
                      borderColor: "#d1d5db",
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      backgroundColor: "#fff",
                    }}
                  />
                </View>
              )}
            </>
          )}
        </View>
        
        {!isTournament && (
          <>
            <Text style={styles.label}>Qualifying Round</Text>
            <View style={content.optionRow}>
              <TouchableOpacity
                onPress={() => setIsQualifying(true)}
                style={[content.optionButton, isQualifying && content.optionButtonActive]}
              >
                <Text
                  style={[
                    content.optionButtonText,
                    isQualifying && content.optionButtonTextActive,
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsQualifying(false)}
                style={[content.optionButton, !isQualifying && content.optionButtonActive]}
              >
                <Text
                  style={[
                    content.optionButtonText,
                    !isQualifying && content.optionButtonTextActive,
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.playersHeaderRow}>
              <Text style={styles.label}>Players</Text>

              <TouchableOpacity
                style={[content.secondaryButton, content.smallButton]}
                onPress={addPlayer}
              >
                <Text style={content.secondaryButtonText}>+ Add Another Player</Text>
              </TouchableOpacity>

            </View>

            {players.map((player, index) => (
              <View key={index} style={styles.playerRow}>
                {player.locked ? (
                  <View style={[styles.input, styles.lockedPlayerBox]}>
                    <Text style={styles.lockedPlayerText}>{player.display_name}</Text>
                  </View>
                ) : (
                  <TextInput
                    value={player.display_name}
                    onChangeText={(value) => updatePlayer(index, value)}
                    style={[styles.input, styles.playerInput]}
                    placeholder={`Player ${index + 1}`}
                  />
                )}

                {index > 0 && (
                  <TouchableOpacity
                    style={content.removeButton}
                    onPress={() => removePlayer(index)}
                  >
                    <Text style={content.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        )}

        <TouchableOpacity
          style={[
            content.primaryButton,
            saving && content.primaryButtonDisabled,
          ]}
          onPress={handleCreateRound}
          disabled={saving}
        >
          <Text style={content.primaryButtonText}>
            {saving
              ? "Creating..."
              : isTournament
              ? tournamentMode === "join"
                ? "Join Tournament"
                : "Create Tournament"
              : "Create Round"}
          </Text>
        </TouchableOpacity>




      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  infoLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 16,
    color: "#111827",
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
    color: "#111827",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
  },
  playersHeaderRow: {
    marginTop: 8,
    marginBottom: 8,
  },
  addPlayerButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
  },
  addPlayerButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
  playerRow: {
    marginBottom: 10,
  },
  playerInput: {
    marginBottom: 8,
  },
  lockedPlayerBox: {
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    marginBottom: 8,
  },
  lockedPlayerText: {
    color: "#111827",
    fontWeight: "600",
  },
  
});