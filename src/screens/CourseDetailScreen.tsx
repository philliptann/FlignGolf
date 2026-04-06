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
import { contentStyles as style } from "../styles/contentStyles";
import ScreenBackground from "../components/ScreenBackground";
import { colors } from "../styles/colors";

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
        headerBackground: "#f8d95f",
        headerText: "#111827",
        bodyBackground: active ? "#fef9c3" : "#ffffff",
        borderColor: active ? "#eab308" : "#d1d5db",
        headerDivider: "transparent",
      };
    case "red":
      return {
        headerBackground: "#e25151",
        headerText: "#ffffff",
        bodyBackground: active ? "#fee2e2" : "#ffffff",
        borderColor: active ? "#b91c1c" : "#d1d5db",
        headerDivider: "transparent",
      };
    case "blue":
      return {
        headerBackground: "#5785e9",
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
        headerBackground: "#3da664",
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

  if (loading) {
    return (
      <ScreenBackground>
        <ActivityIndicator style={style.loading} />
      </ScreenBackground>
    );
  }

  if (error) {
    return (
      <ScreenBackground>
        <Text style={[style.error, { padding: 16 }]}>{error}</Text>
      </ScreenBackground>
    );
  }

  if (!course) {
    return (
      <ScreenBackground>
        <Text style={[style.body, { padding: 16 }]}>Course not found</Text>
      </ScreenBackground>
    );
  }

  const mapAddress = [
    course.postcode,
    course.address,
    course.city,
    course.region,
    course.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <ScreenBackground>
      <View style={localStyles.container}>
        <View>
          <Text style={style.title}>{course.name}</Text>

          {!!course.address && <Text style={style.body}>{course.address}</Text>}
          {!!course.city && <Text style={style.body}>{course.city}</Text>}
          {!!course.region && <Text style={style.body}>{course.region}</Text>}
          {!!course.postcode && <Text style={style.body}>{course.postcode}</Text>}
          {!!course.country && <Text style={style.body}>{course.country}</Text>}

          {(course.holes || course.par) && (
            <Text style={localStyles.metaText}>
              {course.holes ? `${course.holes} holes` : ""}
              {course.holes && course.par ? " • " : ""}
              {course.par ? `Par ${course.par}` : ""}
            </Text>
          )}

          <TouchableOpacity
            style={[
              style.primaryButton,
              !selectedTeeSet && style.primaryButtonDisabled,
              { opacity: selectedTeeSet ? 1 : 0.5 },
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
            <Text style={style.primaryButtonText}>Create Round</Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={style.secondaryButton}
            onPress={() => navigation.navigate("RoundHistory")}
          >
            <Text style={style.secondaryButtonText}>My Rounds</Text>
          </TouchableOpacity>



          {!!mapAddress && (
            <TouchableOpacity
              style={style.outlineButton}
              onPress={() => openMaps(mapAddress)}
            >
              <Text style={style.outlineButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          )}

          {!!course.external_booking_url && (
            <TouchableOpacity
              style={style.outlineButton}
              onPress={() => Linking.openURL(course.external_booking_url)}
            >
              <Text style={style.outlineButtonText}>Visit Course Website</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={localStyles.teeSetSection}>
          {course.tee_sets && course.tee_sets.length > 0 && (
            <>
              <Text style={localStyles.teeSetHeading}>Select Tee Set</Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={localStyles.scrollContent}
              >
                {course.tee_sets.map((teeSet) => {
                  const active = selectedTeeSet?.id === teeSet.id;
                  const colours = getTeeSetCardColours(teeSet.colour, active);

                  return (
                    <TouchableOpacity
                      key={teeSet.id}
                      onPress={() => setSelectedTeeSet(teeSet)}
                      style={[
                        localStyles.teeSetCard,
                        {
                          borderColor: colours.borderColor,
                          backgroundColor: colours.bodyBackground,
                        },
                      ]}
                    >
                      <View
                        style={[
                          localStyles.teeSetHeader,
                          {
                            backgroundColor: colours.headerBackground,
                            borderBottomColor: colours.headerDivider,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            localStyles.teeSetHeaderText,
                            { color: colours.headerText },
                          ]}
                        >
                          {teeSet.name}
                        </Text>
                      </View>

                      <View style={localStyles.teeSetBody}>
                        {!!teeSet.colour && (
                          <Text style={style.body}>Colour: {teeSet.colour}</Text>
                        )}

                        {teeSet.par_total != null && (
                          <Text style={style.body}>Par: {teeSet.par_total}</Text>
                        )}

                        {teeSet.course_rating != null && (
                          <Text style={style.body}>
                            Course rating: {teeSet.course_rating}
                          </Text>
                        )}

                        {teeSet.slope_rating != null && (
                          <Text style={style.body}>
                            Slope rating: {teeSet.slope_rating}
                          </Text>
                        )}

                        {active && (
                          <Text
                            style={[
                              localStyles.selectedText,
                              { color: colours.borderColor },
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

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  metaText: {
    marginTop: 8,
    fontWeight: "600",
    color: "#333",
  },
  teeSetSection: {
    flex: 1,
    marginTop: 20,
  },
  teeSetHeading: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  teeSetCard: {
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    overflow: "hidden",
  },
  teeSetHeader: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  teeSetHeaderText: {
    fontWeight: "700",
    fontSize: 16,
  },
  teeSetBody: {
    padding: 14,
  },
  selectedText: {
    marginTop: 8,
    fontWeight: "700",
    fontSize: 15,
  },
});