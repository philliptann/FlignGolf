// src/screens/rounds/RoundHistoryScreen.tsx
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, Text, TouchableOpacity, View,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { getRounds } from "../../api/roundsApi";
import { RoundListItem, RoundStatus } from "../../types/round";
import RoundCard from "../../features/rounds/components/RoundCard";
import { mapRoundListItem } from "../../features/rounds/utils/roundMappers";

import { contentStyles as styles } from "../../styles/contentStyles";

type FilterOption = "all" | RoundStatus;

const FILTERS: { key: FilterOption; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function RoundHistoryScreen() {
  const navigation = useNavigation<any>();
  const [rounds, setRounds] = useState<RoundListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");

  const loadRounds = useCallback(async (filter: FilterOption) => {
    try {
      setLoading(true);
      setError(null);

      const data =
        filter === "all"
          ? await getRounds()
          : await getRounds({ status: filter });

      setRounds((data.results ?? []).map(mapRoundListItem));
    } catch (err: any) {
     // console.log("Failed to load rounds:", err);
      setError("Failed to load rounds.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRounds(activeFilter);
    }, [loadRounds, activeFilter])
  );

  const renderHeader = () => (
    <View style={{ marginBottom: 16 }}>
     
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 8 }}
      >
        {FILTERS.map((item) => {
          const active = item.key === activeFilter;

          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => setActiveFilter(item.key)}
              style={[
                styles.filterPill,
                active && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  active && styles.filterPillTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {loading ? (
          <>
            {renderHeader()}
            <ActivityIndicator size="large" style={{ marginTop: 24 }} />
          </>
        ) : error ? (
          <>
            {renderHeader()}
            <Text>{error}</Text>
          </>
        ) : (
          <FlatList
            data={rounds}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <RoundCard
                round={item}
                onPress={() => navigation.navigate("RoundPlay", { roundId: item.id })}
              />
            )}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <Text style={{ marginTop: 16 }}>
                No rounds found for this filter.
              </Text>
            }
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}