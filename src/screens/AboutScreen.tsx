
import { Page } from "../types/content.styles";
import { useEffect, useState } from "react";
import { ScrollView, Text, ActivityIndicator, Pressable } from "react-native";
import { apiGet } from "../api/client";
import { contentStyles as styles } from "../styles/contentStyles";
import ScreenBackground from "../components/ScreenBackground";
import { useAuth } from "../auth/AuthContext";


export default function AboutScreen() {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { logout } = useAuth();

  useEffect(() => {
    apiGet<Page>("/api/pages/about/")
      .then(setPage)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />;

  if (error)
    return (
      <ScrollView style={{ padding: 16 }}>
        <Text style={{ color: "red" }}>{error}</Text>
      </ScrollView>
    );

  if (!page) return <Text>Failed to load</Text>;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.body}>{page.body}</Text>
      </ScrollView>
    </ScreenBackground>
  );
}
