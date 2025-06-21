// App.tsx

import { RNMediapipe } from '@thinksys/react-native-mediapipe';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { analyzeSquat, resetCounter } from '../utils/exerciseAnalyzer'; // Import your analyzer

const { width, height } = Dimensions.get('window');

function App(): JSX.Element {
  // Camera permissions
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back'); // Or 'front' for a selfie view if preferred

  // State for exercise tracking
  const [currentReps, setCurrentReps] = useState<number>(0);
  const [currentFeedback, setCurrentFeedback] = useState<string>('Ready to squat!');

  // Request camera permissions on app start
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]); // Add requestPermission to dependency array

  // Handler for landmark data from RNMediapipe
  const handleLandmarkData = (event: any) => {
    // The `event` object will contain the landmark data.
    // Check the exact structure from @thinksys/react-native-mediapipe documentation.
    // It might be `event.nativeEvent.landmarks` or just `event.landmarks`.
    // For this example, we assume `event.landmarks` directly provides the PoseLandmarks object.
    
    // You might also need to normalize coordinates if the library provides them relative to the camera frame
    // and your analyzer expects them relative to the screen or a fixed scale.
    
    if (event && event.landmarks) {
      const { repCount, feedback } = analyzeSquat(event.landmarks);
      setCurrentReps(repCount);
      setCurrentFeedback(feedback);
    }
  };

  // Render loading state while permissions are being requested
  if (!hasPermission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>Requesting Camera Permission...</Text>
        <Text style={styles.permissionText}>Please grant access to use the trainer.</Text>
      </View>
    );
  }

  // Render error if no camera device is found
  if (device == null) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>No camera device found.</Text>
        <Text style={styles.permissionText}>Please ensure your device has a camera and is correctly configured.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        // If you were using a Frame Processor directly with vision-camera:
        // frameProcessor={frameProcessor}
        // frameProcessorFps={5} // Process frames at 5 FPS for performance
      />

      {/* MediaPipe Pose Overlay - it draws the skeleton directly */}
      {/* The dimensions passed to RNMediapipe should match the camera view dimensions */}
      <RNMediapipe
        width={width} // Pass the width of the camera view
        height={height} // Pass the height of the camera view
        onLandmark={handleLandmarkData}
        // Optional props to control what RNMediapipe draws (check its documentation)
        // For example, to hide specific body parts:
        // face={false} leftArm={false} rightArm={false}
        // torso={true} leftLeg={true} rightLeg={true}
        style={StyleSheet.absoluteFillObject} // <--- THIS IS THE CORRECTED LINE
      />

      {/* UI Overlay for Reps and Feedback */}
      <View style={styles.overlay}>
        <Text style={styles.repCounter}>Squats: {currentReps}</Text>
        <Text style={styles.feedbackText}>{currentFeedback}</Text>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            const { repCount, feedback } = resetCounter();
            setCurrentReps(repCount);
            setCurrentFeedback(feedback);
          }}
        >
          <Text style={styles.resetButtonText}>Reset Counter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  overlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20, // Adjust for iOS notch/status bar
    width: '100%',
    alignItems: 'center',
    padding: 20,
    // Add a slight background for readability if needed
    // backgroundColor: 'rgba(0,0,0,0.4)',
  },
  repCounter: {
    fontSize: 60,
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  feedbackText: {
    fontSize: 28,
    color: '#FFD700', // Gold color for feedback
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  resetButton: {
    marginTop: 30,
    backgroundColor: '#007AFF', // iOS blue
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Android shadow
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;