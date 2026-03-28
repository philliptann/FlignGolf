// src/screens/rounds/RoundCreateScreen.tsx
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenBackground from "../../components/ScreenBackground";
import { contentStyles as content } from "../../styles/contentStyles";
import { createRound } from "../../api/roundsApi";
import TeeSetBadge from "../../features/rounds/components/TeeSetBadge";

export default function RoundCreateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { courseId, courseName, teeSetId = 1, teeSetName = "Default Tee", teeSetColour = null, } = route.params || {};


  const [name, setName] = useState(`${courseName || "Course"} Round`);
  const [datePlayed, setDatePlayed] = useState(new Date().toISOString().slice(0, 10));
  const [playerName, setPlayerName] = useState("Player 1");
  const [scoringFormat, setScoringFormat] = useState("stableford");
  const [saving, setSaving] = useState(false);

  const handleCreateRound = async () => {
    if (!courseId) {
      Alert.alert("Error", "Course is missing.");
      return;
    }

    if (!playerName.trim()) {
      Alert.alert("Validation", "Please enter at least one player name.");
      return;
    }

    try {
      setSaving(true);

      const created = await createRound({
        name: name.trim(),
        course_id: Number(courseId),
        tee_set_id: Number(teeSetId),
        scoring_format: scoringFormat,
        date_played: datePlayed,
        players: [{ display_name: playerName.trim() }],
        });

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
            <TeeSetBadge teeSetName={`${teeSetName} Tee`} teeSetColour={teeSetColour} />
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
        <TextInput
          value={scoringFormat}
          onChangeText={setScoringFormat}
          style={styles.input}
          placeholder="stableford"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Player Name</Text>
        <TextInput
          value={playerName}
          onChangeText={setPlayerName}
          style={styles.input}
          placeholder="Player 1"
        />

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
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
});
