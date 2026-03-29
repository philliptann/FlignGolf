// src/screens/rounds/RoundCreateScreen.tsx
import { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenBackground from "../../components/ScreenBackground";
import { contentStyles as content } from "../../styles/contentStyles";
import { createRound } from "../../api/roundsApi";
import TeeSetBadge from "../../features/rounds/components/TeeSetBadge";
import { useAuth } from "../../auth/AuthContext";

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
  const [datePlayed, setDatePlayed] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [scoringFormat, setScoringFormat] = useState<
    "stableford" | "strokeplay" | "matchplay"
  >("stableford");

  const [isQualifying, setIsQualifying] = useState(true);



  const [players, setPlayers] = useState<PlayerDraft[]>([
    {
      display_name: primaryDisplayName,
      user_id: user?.id,
      locked: true,
    },
  ]);

  const [saving, setSaving] = useState(false);

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

  const handleCreateRound = async () => {
    if (!courseId) {
      Alert.alert("Error", "Course is missing.");
      return;
    }

    const cleanedPlayers = players.map((player) => ({
      ...player,
      display_name: player.display_name.trim(),
    }));

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

    try {
      setSaving(true);

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

      // console.log("Create round payload:", JSON.stringify(payload, null, 2));

      const created = await createRound(payload);

      Alert.alert("Success", "Round created.");
      navigation.replace("RoundPlay", { roundId: created.id });
    } catch (err: any) {
      console.log("Failed to create round:", err);
      Alert.alert("Error", "Failed to create round.");
    } finally {
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
        <View style={styles.optionRow}>
          {SCORING_FORMAT_OPTIONS.map((option) => {
            const active = scoringFormat === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setScoringFormat(option.value)}
                style={[styles.optionButton, active && styles.optionButtonActive]}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    active && styles.optionButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Qualifying Round</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            onPress={() => setIsQualifying(true)}
            style={[styles.optionButton, isQualifying && styles.optionButtonActive]}
          >
            <Text
              style={[
                styles.optionButtonText,
                isQualifying && styles.optionButtonTextActive,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsQualifying(false)}
            style={[styles.optionButton, !isQualifying && styles.optionButtonActive]}
          >
            <Text
              style={[
                styles.optionButtonText,
                !isQualifying && styles.optionButtonTextActive,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.playersHeaderRow}>
          <Text style={styles.label}>Players</Text>
          <TouchableOpacity style={styles.addPlayerButton} onPress={addPlayer}>
            <Text style={styles.addPlayerButtonText}>+ Add Player</Text>
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
                style={styles.removeButton}
                onPress={() => removePlayer(index)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleCreateRound}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Creating..." : "Create Round"}
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
  removeButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fee2e2",
    borderRadius: 999,
  },
  removeButtonText: {
    color: "#991b1b",
    fontWeight: "600",
  },
  button: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#2563eb",
    borderRadius: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
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
    backgroundColor: "#e5e7eb",
  },
  optionButtonActive: {
    backgroundColor: "#2563eb",
  },
  optionButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
  optionButtonTextActive: {
    color: "#ffffff",
  },
});