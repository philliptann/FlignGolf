// CoursesScreen.tsx
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { apiGet } from "../api/client";
import { useNavigation } from "@react-navigation/native";
import { contentStyles as content } from "../styles/contentStyles";
import { listStyles as list } from "../styles/listStyles";
import ScreenBackground from "../components/ScreenBackground";

type Course = {
  id: number;
  name: string;
  city: string;
  region: string;
  country: string;
};

export default function CoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<any>();

 
  useEffect(() => {
  apiGet<Course[] | { results: Course[] }>("/api/courses/")
    .then((data) => setCourses(Array.isArray(data) ? data : data.results ?? []))
    .catch((e) => setError(e.message))
    .finally(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;

    return courses.filter((c) =>
      [
        c.name,
        c.city,
        c.region,
        c.country,
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
          <TouchableOpacity
            style={list.card}
            onPress={() => navigation.navigate("CourseDetail", { courseId: item.id })}
          >
            <Text style={content.sectionTitle}>{item.name}</Text>
            <Text style={content.body}>
              {item.city}
              {item.region ? `, ${item.region}` : ""} — {item.country}
            </Text>
          </TouchableOpacity>
        )}
      />
    </ScreenBackground>
  </View>
);
}

