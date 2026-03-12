import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { CONSENT_TEXT } from "../content/consentText";

type Props = {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
};

export default function ConsentModal({ visible, onClose, onAccept }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 16,
            maxHeight: "80%",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
            Consent & Terms
          </Text>

          <ScrollView style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, lineHeight: 20, color: "#333" }}>
              {CONSENT_TEXT}
            </Text>
          </ScrollView>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#ddd",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "600" }}>Close</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                onAccept();
                onClose();
              }}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 10,
                backgroundColor: "#0a7",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>I Accept</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}


