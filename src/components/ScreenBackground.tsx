// ScreenBackground.tsx
import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

type Props = {
  children: React.ReactNode;
};

export default function ScreenBackground({ children }: Props) {
  return (
    <ImageBackground
      source={require("../../assets/fg.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.85)", // “frosted” light overlay
  },
});
