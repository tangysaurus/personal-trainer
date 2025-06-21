import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { Video } from "expo-av";
import { useIsFocused } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function AITrainerUI() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef<Camera>(null);
  const isFocused = useIsFocused();

  const [feedback, setFeedback] = useState("Get Ready...");
  const [countdown, setCountdown] = useState(3);
  const [repCount, setRepCount] = useState(0);

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      const interval = setInterval(() => {
        const options = ["Perfect!", "Great!", "Okay", "Try Again"];
        const result = options[Math.floor(Math.random() * options.length)];
        setFeedback(result);
        setRepCount((prev) => prev + 1);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [countdown]);

  if (!permission?.granted) {
    return <Text style={styles.text}>Camera permission is required</Text>;
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={CameraType.front}
          ratio="16:9"
        />
      )}

      {/* Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.feedback}>
          {countdown > 0 ? `Starting in ${countdown}` : feedback}
        </Text>
        <Text style={styles.rep}>Reps: {repCount}</Text>

        {/* Trainer demo video */}
        <Video
          source={require("../assets/trainer-demo.mp4")} // add your file in assets folder
          style={styles.demo}
          shouldPlay
          isLooping
          isMuted
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 20,
  },
  feedback: {
    textAlign: "center",
    fontSize: 32,
    color: "#fff",
    marginTop: 50,
    fontWeight: "bold",
  },
  rep: {
    position: "absolute",
    top: 40,
    left: 20,
    fontSize: 20,
    color: "#fff",
  },
  demo: {
    width: 140,
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
    borderColor: "#fff",
    borderWidth: 2,
    alignSelf: "flex-end",
    marginBottom: Platform.OS === "android" ? 60 : 40,
  },
  text: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    paddingTop: 100,
    fontSize: 18,
  },
});
