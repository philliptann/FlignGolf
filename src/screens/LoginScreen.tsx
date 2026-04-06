// LoginScreen.tsx
import { useState } from "react";
import { ActivityIndicator, Text, TextInput, View, Pressable } from "react-native";
import { useAuth } from "../auth/AuthContext";
import ScreenBackground from "../components/ScreenBackground";
import { contentStyles as styles } from "../styles/contentStyles";

export default function LoginScreen({ navigation }: any) {
  const { login, authBusy } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (authBusy) return;
    setError(null);

    const u = username.trim();
    if (!u) return setError("Please enter your username.");
    if (!password) return setError("Please enter your password.");

    try {
      await login(u, password);
    } catch (e: any) {
      const msg = String(e?.message || "");

      if (msg === "NETWORK_ERROR") {
        setError("No internet connection. Turn off Flight Mode / enable Wi-Fi or mobile data and try again.");
      } else if (msg === "UNAUTHENTICATED" || msg.includes("401")) {
        setError("Incorrect username or password.");
      } else if (msg === "SERVER_ERROR" || msg.includes("500")) {
        setError("Server error. Please try again later.");
      } else {
        setError("Couldn't sign in. Please try again.");
      }
    }
  }

  return (
        <ScreenBackground>
      <View style={[styles.container, styles.screenCenter]}>
        <Text style={styles.title}>Sign in</Text>

        <TextInput
          placeholder="Username"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          returnKeyType="next"
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          onPress={onSubmit}
          disabled={authBusy}
          style={[
            styles.primaryButton,
            authBusy && styles.primaryButtonDisabled,
          ]}
        >
          {authBusy ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.primaryButtonText}>Login</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Register")}
          disabled={authBusy}
          style={[styles.linkCenter, { opacity: authBusy ? 0.5 : 1 }]}
        >
          <Text style={styles.link}>Create an account</Text>
        </Pressable>
      </View>
    </ScreenBackground>
  );
}

// const fieldStyle = {
//   borderWidth: 1,
//   borderColor: "#ddd",
//   borderRadius: 10,
//   padding: 12,
//   marginBottom: 12,
// } as const;
