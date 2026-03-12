//RulesScreen.tsx
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import { apiGet } from "../api/client";
import { contentStyles as styles } from "../styles/contentStyles";
import ScreenBackground from "../components/ScreenBackground";

type RuleSection = {
  id: number;
  order: number;
  title: string;
  body: string;
  updated_at: string;
};

export default function RulesScreen() {
  const [rules, setRules] = useState<RuleSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  apiGet<RuleSection[]>("/api/rules/")
    .then(setRules)
    .catch((e) => setError(e.message))
    .finally(() => setLoading(false));
}, []);


  if (loading) {
    return <ActivityIndicator style={styles.loading} />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScreenBackground>
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.heading}>Rules of FlingGolf</Text>

    {rules.map((rule) => (
      <View key={rule.id} style={styles.section}>
        <Text style={styles.sectionTitle}>
          {rule.order}. {rule.title}
        </Text>
        <Text style={styles.body}>{rule.body}</Text>
      </View>
    ))}
  </ScrollView>
  </ScreenBackground>
);
}

