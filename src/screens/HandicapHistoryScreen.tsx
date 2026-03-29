import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ScreenBackground from "../components/ScreenBackground";
import { contentStyles as content } from "../styles/contentStyles";
import {
  getHandicapHistory,
  HandicapHistoryItem,
} from "../api/handicapApi";

function getAdjustmentLabel(item: HandicapHistoryItem) {
  if (item.adjustment_type === "decrease") {
    return `-${item.adjustment_value ?? "0.0"}`;
  }
  if (item.adjustment_type === "increase") {
    return `+${item.adjustment_value ?? "0.0"}`;
  }
  return "0.0";
}

function getAdjustmentColor(item: HandicapHistoryItem) {
  if (item.adjustment_type === "decrease") return "#166534";
  if (item.adjustment_type === "increase") return "#991b1b";
  return "#374151";
}

export default function HandicapHistoryScreen() {
  const [items, setItems] = useState<HandicapHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (mode: "initial" | "refresh" = "initial") => {
    try {
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);

      const data = await getHandicapHistory();
      setItems(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Failed to load handicap history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 32 }} />;
  }

  return (
    <ScreenBackground>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={stylesLocal.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load("refresh")} />
        }
        ListHeaderComponent={
          <View style={stylesLocal.headerCard}>
            <Text style={stylesLocal.headerTitle}>Handicap History</Text>
            <Text style={stylesLocal.headerValue}>
              Current Handicap: {items[0]?.handicap_index ?? "-"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={content.body}>
            {error || "No handicap history found yet."}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={stylesLocal.card}>
            <View style={stylesLocal.rowBetween}>
              <Text style={stylesLocal.dateText}>{item.effective_date}</Text>
              <Text
                style={[
                  stylesLocal.adjustmentText,
                  { color: getAdjustmentColor(item) },
                ]}
              >
                {getAdjustmentLabel(item)}
              </Text>
            </View>

            <Text style={stylesLocal.mainValue}>
              Handicap: {item.old_exact_handicap ?? "-"} →{" "}
              {item.new_exact_handicap ?? item.handicap_index}
            </Text>

            <Text style={content.body}>Gross: {item.gross_score ?? "-"}</Text>
            <Text style={content.body}>Net: {item.net_score ?? "-"}</Text>
            <Text style={content.body}>Target: {item.target_score ?? "-"}</Text>
            <Text style={content.body}>
              Differential: {item.nett_differential ?? "-"}
            </Text>
            <Text style={content.body}>
              Qualifying: {item.is_qualifying ? "Yes" : "No"}
            </Text>
            <Text style={stylesLocal.sourceText}>
              Source: {item.source || "manual"}
            </Text>
          </View>
        )}
      />
    </ScreenBackground>
  );
}

const stylesLocal = StyleSheet.create({
  container: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  headerValue: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dateText: {
    fontWeight: "600",
    color: "#111827",
  },
  adjustmentText: {
    fontWeight: "700",
  },
  mainValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  sourceText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },
});