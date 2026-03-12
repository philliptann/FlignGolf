// ProfileScreen.tsx
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import ScreenBackground from "../components/ScreenBackground";
import { useAuth } from "../auth/AuthContext";
import { contentStyles as styles } from "../styles/contentStyles";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 16, color: "#111" }}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, authBusy, updateMe } = useAuth();

  const profile = useMemo(() => user?.profile ?? {}, [user]);

  const [editing, setEditing] = useState(false);

  // Editable fields (now includes first/last name on User)
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // hydrate fields from current user
  useEffect(() => {
    if (!user) return;
    setEmail(user.email || "");
    setFirstName((user as any).first_name || "");
    setLastName((user as any).last_name || "");
    setDisplayName(profile.display_name || "");
    setCountry((profile.country || "").toUpperCase());
  }, [user, profile.display_name, profile.country]);

  if (!user) {
    return (
      <ScreenBackground>
        <View style={[styles.container, styles.screenCenter]}>
          <ActivityIndicator />
        </View>
      </ScreenBackground>
    );
  }

  function onCancel() {
    setError(null);
    setSavedMsg(null);
    setEditing(false);

    // revert to current user values
    setEmail(user.email || "");
    setFirstName((user as any).first_name || "");
    setLastName((user as any).last_name || "");
    setDisplayName(profile.display_name || "");
    setCountry((profile.country || "").toUpperCase());
  }

  async function onSave() {
    if (authBusy) return;

    setError(null);
    setSavedMsg(null);

    const c = country.trim().toUpperCase();
    if (c && c.length !== 2) {
      return setError("Country must be a 2-letter code (e.g. GB).");
    }

    try {
      await updateMe({
        email: email.trim(), // allow blank
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        display_name: displayName.trim(),
        country: c,
      } as any);

      setEditing(false);
      setSavedMsg("Saved.");
    } catch (e: any) {
      const msg = String(e?.message || "");
      setError(msg || "Failed to save profile.");
    }
  }

  const u: any = user; // so we can safely read first_name/last_name

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text style={styles.title}>Profile</Text>

          {!editing ? (
            <Pressable
              onPress={() => {
                setError(null);
                setSavedMsg(null);
                setEditing(true);
              }}
            >
              <Text style={styles.link}>Edit</Text>
            </Pressable>
          ) : (
            <View style={{ flexDirection: "row", gap: 14 }}>
              <Pressable
                onPress={onCancel}
                disabled={authBusy}
                style={{ opacity: authBusy ? 0.5 : 1 }}
              >
                <Text style={styles.link}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={onSave}
                disabled={authBusy}
                style={{ opacity: authBusy ? 0.5 : 1 }}
              >
                <Text style={styles.link}>Save</Text>
              </Pressable>
            </View>
          )}
        </View>

        {error && <Text style={[styles.error, { marginBottom: 12 }]}>{error}</Text>}
        {savedMsg && (
          <Text style={{ marginBottom: 12, color: "#0a7", fontWeight: "600" }}>
            {savedMsg}
          </Text>
        )}

        <Row label="Username" value={user.username || "-"} />

        {!editing ? (
          <>
            <Row label="Email" value={user.email || "-"} />
            <Row label="First name" value={u.first_name || "-"} />
            <Row label="Last name" value={u.last_name || "-"} />
            <Row label="Display name" value={profile.display_name || "-"} />
            <Row label="Country" value={profile.country || "-"} />
          </>
        ) : (
          <>
            <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email (optional)"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              editable={!authBusy}
            />

            <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
              First name
            </Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name (optional)"
              style={styles.input}
              editable={!authBusy}
            />

            <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
              Last name
            </Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name (optional)"
              style={styles.input}
              editable={!authBusy}
            />

            <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
              Display name
            </Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display name (optional)"
              style={styles.input}
              editable={!authBusy}
            />

            <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
              Country
            </Text>
            <TextInput
              value={country}
              onChangeText={(t) => setCountry(t.toUpperCase())}
              placeholder="Country (optional, 2-letter e.g. GB)"
              autoCapitalize="characters"
              maxLength={2}
              style={styles.input}
              editable={!authBusy}
            />
          </>
        )}

        <Row
          label="Role"
          value={
            profile.is_platform_admin
              ? "Platform admin"
              : profile.is_club_admin
              ? "Club admin"
              : "Player"
          }
        />

        <Row
          label="Consent accepted"
          value={profile.consent_accepted ? "Yes" : "No"}
        />
      </ScrollView>
    </ScreenBackground>
  );
}
