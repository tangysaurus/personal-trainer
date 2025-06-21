import React from "react";
import { View, StyleSheet } from "react-native";
import AITrainerUI from "../components/AITrainerUI";

export default function Home() {
  return (
    <View style={styles.container}>
      <AITrainerUI />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
