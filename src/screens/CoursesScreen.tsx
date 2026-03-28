// src/screens/CoursesScreen.tsx

import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Linking,
  Platform,
} from "react-native";
import { apiGet } from "../api/client";
import { useNavigation } from "@react-navigation/native";
import { contentStyles as content } from "../styles/contentStyles";
import { listStyles as list } from "../styles/listStyles";
import ScreenBackground from "../components/ScreenBackground";

type Course = {
  id: number;
  name: string;
  club_name?: string;
  holes?: number;
  par_total?: number;
  city?: string;
  region?: string;
  country?: string;
  postcode?: string;
  external_booking_url?: string;
};

function openMaps(address: string) {
  const encoded = encodeURIComponent(address);

  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?q=${encoded}`
      : `https://www.google.com/maps/search/?api=1&query=${encoded}`;

  Linking.openURL(url);
}

export default function CoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<any>();

 
  useEffect(() => {
    apiGet<Course[] | { results: Course[] }>("/api/courses/")
      .then((data) => {
        const rows = Array.isArray(data) ? data : data.results ?? [];
        console.log("Courses response:", JSON.stringify(rows, null, 2));
        setCourses(rows);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(() => {
  const q = query.trim().toLowerCase();
  if (!q) return courses;

  return courses.filter((c) =>
    [
      c.name,
      c.club_name,
      c.city,
      c.region,
      c.country,
      c.postcode,
      c.holes != null ? String(c.holes) : "",
      c.par_total != null ? String(c.par_total) : "",
    ]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(q))
  );
}, [courses, query]);

  if (loading) return <ActivityIndicator style={content.loading} />;
  if (error) return <Text style={[content.error, { padding: 16 }]}>{error}</Text>;

  return (
  <View style={list.screen}>
    <View style={list.searchContainer}>
      <TextInput
        placeholder="Search courses, city, country…"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        clearButtonMode="while-editing"
        style={list.searchInput}
      />
    </View>
    <ScreenBackground>
      <FlatList
        data={filteredCourses}
        
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={list.list}
        ItemSeparatorComponent={() => <View style={list.separator} />}
        ListEmptyComponent={<Text style={list.empty}>No courses found</Text>}

        renderItem={({ item }) => (
          <View style={list.card}>
            <Text style={content.sectionTitle}>{item.name}</Text>

            {!!item.club_name && (
              <Text style={content.body}>{item.club_name}</Text>
            )}

            <Text style={content.body}>
              {item.holes != null ? `${item.holes} holes` : ""}
              {item.holes != null && item.par_total != null ? " • " : ""}
              {item.par_total != null ? `Par ${item.par_total}` : ""}
            </Text>

            {!!(item.city || item.region || item.country) && (
              <Text style={content.body}>
                {[item.city, item.region, item.country].filter(Boolean).join(", ")}
              </Text>
            )}

            {!!item.postcode && (
              <Text style={content.body}>{item.postcode}</Text>
            )}

            <View style={{ flexDirection: "row", marginTop: 12, gap: 10 }}>

              <TouchableOpacity
                onPress={() =>
                  openMaps(
                    [item.postcode, item.city, item.region, item.country]
                      .filter(Boolean)
                      .join(", ")
                  )
                }
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: "#2563eb",
                  borderRadius: 8,
                  backgroundColor: "#fff",
                }}
              >
                <Text
                  style={{
                    color: "#2563eb",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  Maps
                </Text>
              </TouchableOpacity>

              {!!item.external_booking_url && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(item.external_booking_url!)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: "#2563eb",
                    borderRadius: 8,
                    backgroundColor: "#fff",
                  }}
                >
                  <Text
                    style={{
                      color: "#2563eb",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Book
                  </Text>
                </TouchableOpacity>
                
              )}
                            <TouchableOpacity
                onPress={() => navigation.navigate("CourseDetail", { courseId: item.id })}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: "#2563eb",
                  borderRadius: 8,
                  backgroundColor: "#fff",
                }}
              >
                <Text
                  style={{
                    color: "#2563eb",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  Play
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}


        
      />
    </ScreenBackground>
  </View>
);
}

