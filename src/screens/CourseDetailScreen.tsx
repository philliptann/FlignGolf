//CoursesDetailsScreen.tsx

import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, ScrollView, Text, View, TouchableOpacity, StyleSheet,} from "react-native";
import { apiGet } from "../api/client";
import { Platform } from "react-native";
import { contentStyles as content } from "../styles/contentStyles";
import ScreenBackground from "../components/ScreenBackground";

type CourseDetail = { id: number; name: string; city: string; holes:string; postcode:string;par:string; region: string; country: string; address?: string; external_booking_url?: string;};

function openMaps(address: string) {
  const encoded = encodeURIComponent(address);

  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?q=${encoded}`
      : `https://www.google.com/maps/search/?api=1&query=${encoded}`;

  Linking.openURL(url);
}


export default function CourseDetailScreen({ route }: any) {
  const { courseId } = route.params;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<CourseDetail>(`/api/courses/${courseId}/`)
      .then(setCourse)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [courseId]);
  

  if (loading) return <ActivityIndicator style={{ marginTop: 32 }} />;
  if (error) return <Text style={{ padding: 16 }}>{error}</Text>;
  if (!course) return <Text>Course not found</Text>;

 return (
  <ScreenBackground>
  <ScrollView contentContainerStyle={content.container}>
    <Text style={content.title}>{course.name}</Text>

<>
  {course.address && (
    <Text style={content.body}>{course.address}</Text>
  )}
  {course.city && (
    <Text style={content.body}>{course.city}</Text>
  )}

  {course.region && (
    <Text style={content.body}>{course.region}</Text>
  )}
  {course.postcode && (
    <Text style={content.body}>{course.postcode}</Text>
  )}

  {course.country && (
    <Text style={content.body}>{course.country}</Text>
  )}

  {(course.holes || course.par) && (
    <Text style={[content.body, { marginTop: 8, fontWeight: "600" }]}>
      {course.holes ? `${course.holes} holes` : ""}
      {course.holes && course.par ? " -- " : ""}
      {course.par ? `Par ${course.par}` : ""}
    </Text>
  )}
</>

   {(course.address || course.postcode) && (
  <TouchableOpacity
    style={[styles.mapButton, { marginTop: 12 }]}
    onPress={() =>
      openMaps(
        [
          course.postcode,      // postcode first (most accurate)
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
        onPress={() => Linking.openURL(course.external_booking_url!)}
        >
        <Text style={styles.buttonText}>Visit Course Website</Text>
      </TouchableOpacity>
    )}
  </ScrollView>
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
});




