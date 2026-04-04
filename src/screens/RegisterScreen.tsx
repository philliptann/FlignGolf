// RegisterScreen.tsx
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View, Switch,} from "react-native";
import { useAuth } from "../auth/AuthContext";
import ScreenBackground from "../components/ScreenBackground";
import ConsentModal from "../components/ConsentModal";
import { contentStyles as styles } from "../styles/contentStyles";


export default function RegisterScreen({ navigation }: any) {
  const { register, authBusy } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);

  const [accessCode, setAccessCode] = useState(""); 

  const [error, setError] = useState<string | null>(null);
  const [consentModalOpen, setConsentModalOpen] = useState(false);

  // Refs for "Next" keyboard navigation
  const emailRef = useRef<TextInput>(null);
  const displayNameRef = useRef<TextInput>(null);
  const countryRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  function isStrongPassword(pw: string) {
    // MVP rule: 8+ chars and at least one letter + one number
    return pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
  }

  async function onSubmit() {
    if (authBusy) return;
    setError(null);

    const code = accessCode.trim();
    if (!code) return setError("Access code is required (Private Alpha).");

    const u = username.trim();
    if (!u) return setError("Please enter a username.");

    const c = country.trim().toUpperCase();
    if (c && c.length !== 2) {
      return setError("Country must be a 2-letter code (e.g. GB).");
    }

    if (!consent) {
      setConsentModalOpen(true);
      return;
    }

    if (!isStrongPassword(password)) {
      return setError("Password must be 8+ characters and include a number.");
    }

    try {
      await register({
        access_code: code,
        username: u,
        password,
        consent_accepted: true,
        email: email.trim() || undefined,
        display_name: displayName.trim() || undefined,
        country: c || undefined,
      });
      // register() auto-logs in and app will switch to tabs
    } catch (e: any) {
        const msg = String(e?.message || "");

        // ✅ 1) network/offline case first
        if (msg === "NETWORK_ERROR" || msg.includes("Network request failed")) {
          setError("No internet connection. Please connect and try again.");
          return;
        }
        if (
          msg.includes("403") ||
          msg.toLowerCase().includes("invalid access code") ||
          msg.toLowerCase().includes("access code")
        ) {
          setError("Incorrect access code");
          return;
        }

        // ✅ 2) only try parse if we actually have JSON text
        const jsonPart = msg.includes("\n") ? msg.split("\n").slice(1).join("\n").trim() : "";
        if (!jsonPart) {
          setError("Registration failed. Please try again.");
          return;
        }

        try {
          const data = JSON.parse(jsonPart);

          if (data?.username?.length) return setError(data.username[0]);
          if (data?.email?.length) return setError(data.email[0]);
          if (data?.password?.length) return setError(data.password[0]);
          if (data?.consent_accepted?.length) return setError(data.consent_accepted[0]);
          if (data?.non_field_errors?.length) return setError(data.non_field_errors[0]);
          if (typeof data?.detail === "string") {
          if (data.detail.toLowerCase().includes("access")) {
            return setError("Incorrect access code");
          }
          return setError(data.detail);
}

          setError("Please check your details and try again.");
        } catch {
          setError("Registration failed. Please try again.");
        }
      }
  }
  

  return (
    <ScreenBackground>
      <View style={[styles.container, styles.screenCenter]}>
        <Text style={styles.title}>Create account</Text>

        <TextInput
          placeholder="Access code (Private Alpha) *"
          autoCapitalize="none"
          autoCorrect={false}
          value={accessCode}
          onChangeText={setAccessCode}
          style={styles.input}
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
        />

        <TextInput
          placeholder="Username *"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
        />

        <TextInput
          ref={emailRef}
          placeholder="Email (optional but required for updates)"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          returnKeyType="next"
          onSubmitEditing={() => displayNameRef.current?.focus()}
        />

        <TextInput
          ref={displayNameRef}
          placeholder="Display name"
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
          returnKeyType="next"
          onSubmitEditing={() => countryRef.current?.focus()}
        />

        <TextInput
          ref={countryRef}
          placeholder="Country (optional, 2-letter e.g. GB)"
          autoCapitalize="characters"
          value={country}
          onChangeText={setCountry}
          style={styles.input}
          maxLength={2}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <TextInput
          ref={passwordRef}
          placeholder="Password * (min 8 chars)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Switch value={consent} onValueChange={setConsent} />
          <Text style={{ marginLeft: 10, flex: 1 }}>I accept the consent terms *</Text>

          <Pressable
            onPress={() => setConsentModalOpen(true)}
            disabled={authBusy}
            style={{ opacity: authBusy ? 0.5 : 1 }}
          >
            <Text style={styles.link}>View Agreement</Text>
          </Pressable>
        </View>

        <ConsentModal
          visible={consentModalOpen}
          onClose={() => setConsentModalOpen(false)}
          onAccept={() => setConsent(true)}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          onPress={onSubmit}
          disabled={authBusy}
          style={[styles.primaryButton, authBusy && styles.primaryButtonDisabled]}
        >
          {authBusy ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.primaryButtonText}>Register</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => navigation.goBack()}
          disabled={authBusy}
          style={[styles.linkCenter, { opacity: authBusy ? 0.5 : 1}]}
        >
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    </ScreenBackground>
  );
}

const fieldStyle = {
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  padding: 12,
  marginBottom: 12,
} as const;
