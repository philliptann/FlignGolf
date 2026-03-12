// components/HomeHeaderTitle.tsx
import { Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";

export default function HomeHeaderTitle() {
  const { user } = useAuth();

  const name =
    user?.profile?.display_name ||
    user?.first_name ||
    user?.username ||
    "";

  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>
        Home
      </Text>
      {name ? (
        <Text style={{ fontSize: 13, color: "#666" }}>
          Hello {name}
        </Text>
      ) : null}
    </View>
  );
}
