import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { CONSENT_TEXT } from "../content/consentText";
import { colors } from "../styles/colors";

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
            backgroundColor: colors.background,
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
            <Text style={{ fontSize: 14, lineHeight: 20, color: colors.body }}>
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
                borderColor: colors.border,
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
                backgroundColor: colors.secondary,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.buttonText, fontWeight: "600" }}>I Accept</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}


