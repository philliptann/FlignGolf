// src/screens/CourseDetailScreen.tsx
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { apiGet } from "../api/client";
import { contentStyles as content } from "../styles/contentStyles";
import ScreenBackground from "../components/ScreenBackground";

type TeeSet = {
  id: number;
  name: string;
  colour?: string | null;
  gender?: string | null;
  course_rating?: number | null;
  slope_rating?: number | null;
  par_total?: number | null;
};

type CourseDetail = {
  id: number;
  name: string;
  city: string;
  holes: string;
  postcode: string;
  par: string;
  region: string;
  country: string;
  address?: string;
  external_booking_url?: string;
  tee_sets?: TeeSet[];
};

function openMaps(address: string) {
  const encoded = encodeURIComponent(address);

  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?q=${encoded}`
      : `https://www.google.com/maps/search/?api=1&query=${encoded}`;

  Linking.openURL(url);
}

function getTeeSetCardColours(colour?: string | null, active?: boolean) {
  const value = (colour || "").trim().toLowerCase();

  switch (value) {
    case "white":
      return {
        headerBackground: "#ffffff",
        headerText: "#111827",
        bodyBackground: active ? "#f9fafb" : "#ffffff",
        borderColor: active ? "#9ca3af" : "#d1d5db",
        headerDivider: "#d1d5db",
      };
    case "yellow":
      return {
        headerBackground: "#facc15",
        headerText: "#111827",
        bodyBackground: active ? "#fef9c3" : "#ffffff",
        borderColor: active ? "#eab308" : "#d1d5db",
        headerDivider: "transparent",
      };
    case "red":
      return {
        headerBackground: "#dc2626",
        headerText: "#ffffff",
        bodyBackground: active ? "#fee2e2" : "#ffffff",
        borderColor: active ? "#b91c1c" : "#d1d5db",
        headerDivider: "transparent",
      };
    case "blue":
      return {
        headerBackground: "#2563eb",
        headerText: "#ffffff",
        bodyBackground: active ? "#dbeafe" : "#ffffff",
        borderColor: active ? "#1d4ed8" : "#d1d5db",
        headerDivider: "transparent",
      };
    case "black":
      return {
        headerBackground: "#111827",
        headerText: "#ffffff",
        bodyBackground: active ? "#e5e7eb" : "#ffffff",
        borderColor: active ? "#111827" : "#d1d5db",
        headerDivider: "transparent",
      };
    case "green":
      return {
        headerBackground: "#16a34a",
        headerText: "#ffffff",
        bodyBackground: active ? "#dcfce7" : "#ffffff",
        borderColor: active ? "#15803d" : "#d1d5db",
        headerDivider: "transparent",
      };
    default:
      return {
        headerBackground: "#e5e7eb",
        headerText: "#111827",
        bodyBackground: active ? "#f3f4f6" : "#ffffff",
        borderColor: active ? "#6b7280" : "#d1d5db",
        headerDivider: "transparent",
      };
  }
}

export default function CourseDetailScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const { courseId } = route.params;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeeSet, setSelectedTeeSet] = useState<TeeSet | null>(null);

  useEffect(() => {
    apiGet<CourseDetail>(`/api/courses/${courseId}/`)
      .then((data) => {
        setCourse(data);

        if (data.tee_sets && data.tee_sets.length > 0) {
          setSelectedTeeSet(data.tee_sets[0]);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <ActivityIndicator style={{ marginTop: 32 }} />;
  if (error) return <Text style={{ padding: 16 }}>{error}</Text>;
  if (!course) return <Text>Course not found</Text>;

  return (
    <ScreenBackground>
      <View style={{ flex: 1, padding: 16 }}>
        <View>
          <Text style={content.title}>{course.name}</Text>

          {!!course.address && <Text style={content.body}>{course.address}</Text>}
          {!!course.city && <Text style={content.body}>{course.city}</Text>}
          {!!course.region && <Text style={content.body}>{course.region}</Text>}
          {!!course.postcode && <Text style={content.body}>{course.postcode}</Text>}
          {!!course.country && <Text style={content.body}>{course.country}</Text>}

          {(course.holes || course.par) && (
            <Text style={[content.body, { marginTop: 8, fontWeight: "600" }]}>
              {course.holes ? `${course.holes} holes` : ""}
              {course.holes && course.par ? " -- " : ""}
              {course.par ? `Par ${course.par}` : ""}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { marginTop: 12, opacity: selectedTeeSet ? 1 : 0.5 },
            ]}
            disabled={!selectedTeeSet}
            onPress={() => {
              if (!selectedTeeSet) return;

              navigation.navigate("RoundCreate", {
                courseId: course.id,
                courseName: course.name,
                teeSetId: selectedTeeSet.id,
                teeSetName: selectedTeeSet.name,
                teeSetColour: selectedTeeSet.colour ?? null,
              });
            }}
          >
            <Text style={styles.primaryButtonText}>Create Round</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { marginTop: 12 }]}
            onPress={() => navigation.navigate("RoundHistory")}
          >
            <Text style={styles.secondaryButtonText}>My Rounds</Text>
          </TouchableOpacity>

          {(course.address || course.postcode) && (
            <TouchableOpacity
              style={[styles.mapButton, { marginTop: 12 }]}
              onPress={() =>
                openMaps(
                  [
                    course.postcode,
                    course.address,
                    course.city,
                    course.region,
                    course.country,
                  ]
                    .filter(Boolean)
                    .join(", ")
                )
              }
            >
              <Text style={styles.mapButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          )}

          {course.external_booking_url && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => Linking.openURL(course.external_booking_url)}
            >
              <Text style={styles.buttonText}>Visit Course Website</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flex: 1, marginTop: 20 }}>
          {course.tee_sets && course.tee_sets.length > 0 && (
            <>
              <Text style={[content.body, { fontWeight: "700", marginBottom: 10 }]}>
                Select Tee Set
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                {course.tee_sets.map((teeSet) => {
                  const active = selectedTeeSet?.id === teeSet.id;
                  const colours = getTeeSetCardColours(teeSet.colour, active);

                  return (
                    <TouchableOpacity
                      key={teeSet.id}
                      onPress={() => setSelectedTeeSet(teeSet)}
                      style={{
                        borderRadius: 10,
                        marginBottom: 10,
                        borderWidth: 2,
                        borderColor: colours.borderColor,
                        backgroundColor: colours.bodyBackground,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: colours.headerBackground,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: colours.headerDivider,
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "700",
                            fontSize: 16,
                            color: colours.headerText,
                          }}
                        >
                          {teeSet.name}
                        </Text>
                      </View>

                      <View style={{ padding: 14 }}>
                        {!!teeSet.colour && (
                          <Text style={content.body}>Colour: {teeSet.colour}</Text>
                        )}

                        {teeSet.par_total != null && (
                          <Text style={content.body}>Par: {teeSet.par_total}</Text>
                        )}

                        {teeSet.course_rating != null && (
                          <Text style={content.body}>
                            Course rating: {teeSet.course_rating}
                          </Text>
                        )}

                        {teeSet.slope_rating != null && (
                          <Text style={content.body}>
                            Slope rating: {teeSet.slope_rating}
                          </Text>
                        )}

                        {active && (
                          <Text
                            style={[
                              content.body,
                              {
                                marginTop: 8,
                                fontWeight: "700",
                                color: colours.borderColor,
                              },
                            ]}
                          >
                            Selected
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
    padding: 14,
    backgroundColor: "#0a7",
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  mapButton: {
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#0a7",
    borderRadius: 10,
  },
  mapButtonText: {
    color: "#0a7",
    textAlign: "center",
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 12,
    padding: 14,
    backgroundColor: "#2563eb",
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  primaryButton: {
    marginTop: 12,
    padding: 14,
    backgroundColor: "#16a34a",
    borderRadius: 10,
  },
  primaryButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});