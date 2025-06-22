// App.tsx

import React, { useState } from 'react';
import { Dimensions, LogBox, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// REMOVED: react-native-vision-camera imports
// import { Camera, useCameraDevice, useCameraPermission, Frame } from 'react-native-vision-camera';
// REMOVED: react-native-reanimated imports for worklets
// import { useFrameProcessor, Worklets } from 'react-native-reanimated';
// import { runOnJS } from 'react-native-reanimated/src/reanimated2/threads'; 

// NEW: Import RNMediapipe component AND the switchCamera function (if it exists as a separate export)
import { RNMediapipe, switchCamera } from '@thinksys/react-native-mediapipe';

// SVG imports for drawing
import Svg, { Circle, Line } from 'react-native-svg';

// Your utility functions
import { analyzeSquat, resetCounter } from '../utils/exerciseAnalyzer';
// UPDATED IMPORT: Use Thinksys types
import { findLandmark, POSE_CONNECTIONS, ThinksysPoseLandmarks } from '../utils/poseUtils';

// Suppress the warning if it's still showing (we're hoping it disappears with this setup)
LogBox.ignoreLogs([
  'Warning: Text strings must be rendered within a <Text> component.',
  // Add other specific warnings if they appear and are known to be harmless
]);

const { width, height } = Dimensions.get('window');

// No CameraFacing type, as RNMediapipe manages camera itself
// type CameraFacing = 'front' | 'back';

function App(): JSX.Element {
  // No vision-camera permissions hooks
  // const { hasPermission, requestPermission } = useCameraPermission();
  // No vision-camera device state
  // const [cameraFacing, setCameraFacing] = useState<CameraFacing>('back');
  // const device = useCameraDevice(cameraFacing);

  // State to manage current camera facing text for UI
  const [cameraFacingText, setCameraFacingText] = useState<'Front' | 'Back'>('Back'); 

  // State for exercise tracking
  const [currentReps, setCurrentReps] = useState<number>(0);
  const [currentFeedback, setCurrentFeedback] = useState<string>('Ready to squat!');
  const [isPersonDetected, setIsPersonDetected] = useState<boolean>(false); 
  
  // State to store detected landmarks for UI drawing
  const [detectedThinksysLandmarks, setDetectedThinksysLandmarks] = useState<ThinksysPoseLandmarks | null>(null);

  // No useEffect for vision-camera permissions. RNMediapipe should handle permissions implicitly.
  // useEffect(() => { /* ... */ }, []);

  // Function to toggle camera facing using RNMediapipe's specific function
  const toggleCameraFacing = () => {
    try {
      switchCamera(); // Attempt to call the switchCamera function
      setCameraFacingText((prev) => (prev === 'Back' ? 'Front' : 'Back')); // Update UI text
    } catch (e: any) { // Catch as any to handle potential runtime errors
      console.error("Error calling switchCamera from @thinksys/react-native-mediapipe:", e.message);
      setCurrentFeedback(`Camera switch failed! Error: ${e.message}`);
    }
    // Reset state on camera switch
    const { repCount, feedback } = resetCounter();
    setCurrentReps(repCount);
    setCurrentFeedback(feedback);
    setIsPersonDetected(false); 
    setDetectedThinksysLandmarks(null); // Clear drawing on camera switch
  };

  const handleLandmarkData = (event: any) => {
    // console.log('RNMediapipe raw event:', event); // Debug raw event structure
    // Ensure event.landmarks matches the ThinksysPoseLandmarks structure { 'left_shoulder': {x,y,z,visibility}, ... }

    const hasMeaningfulLandmarks = event && event.landmarks && Object.keys(event.landmarks).length > 0;

    if (hasMeaningfulLandmarks) {
      setIsPersonDetected(true);
      setDetectedThinksysLandmarks(event.landmarks); // Store landmarks for drawing

      // Log only the first few for brevity
      console.log('AI detected landmarks. First few values:', 
        Object.keys(event.landmarks).slice(0, 3).map(key => `${key}: ${JSON.stringify(event.landmarks[key])}`).join(', ') + '...'
      );

      const { repCount, feedback } = analyzeSquat(event.landmarks);
      setCurrentReps(repCount);
      setCurrentFeedback(feedback);
    } else {
      setIsPersonDetected(false);
      setDetectedThinksysLandmarks(null); // Clear drawing
      console.log('AI detected no landmarks or invalid event structure.');
      setCurrentFeedback("AI not detecting. Adjust position/lighting.");
    }
  };

  // No vision-camera related checks for permission or device == null are needed here
  // as RNMediapipe should manage its camera.

  return (
    <View style={styles.container}>
      {/* RNMediapipe now handles its own camera view and processing */}
      <RNMediapipe
        width={width} // Pass the width of the screen for the camera view
        height={height} // Pass the height of the screen for the camera view
        onLandmark={handleLandmarkData}
        // These props explicitly enable the drawing features of RNMediapipe.
        // If these don't draw, our SVG will.
        face={true}
        leftArm={true}
        rightArm={true}
        leftWrist={true}
        rightWrist={true}
        torso={true}
        leftLeg={true}
        rightLeg={true}
        leftAnkle={true}
        rightAnkle={true}
        style={StyleSheet.absoluteFillObject} // Ensures it overlays the entire screen
      />

      {/* SVG Overlay for drawing the skeleton (only if RNMediapipe drawing doesn't work well) */}
      {/* This drawing is now *in addition to* RNMediapipe's own drawing, if it works.
          If RNMediapipe's drawing works, you can remove these SVG lines/circles or the `face={true}` etc. from RNMediapipe. */}
      {detectedThinksysLandmarks && (
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
          {POSE_CONNECTIONS.map((connection, index) => {
            const p1 = findLandmark(detectedThinksysLandmarks, connection[0]);
            const p2 = findLandmark(detectedThinksysLandmarks, connection[1]);

            // Only draw if both points exist and have high enough confidence
            const MIN_DRAW_VISIBILITY = 0.5; // Thinksys uses 'visibility' for confidence
            if (p1 && p2 && (p1.visibility === undefined || p1.visibility > MIN_DRAW_VISIBILITY) && (p2.visibility === undefined || p2.visibility > MIN_DRAW_VISIBILITY)) {
              return (
                <Line
                  key={index}
                  x1={p1.x * width} // Thinksys coords are normalized 0-1, so scale to screen
                  y1={p1.y * height}
                  x2={p2.x * width}
                  y2={p2.y * height}
                  stroke="lime" 
                  strokeWidth="3"
                />
              );
            }
            return null;
          })}
          {/* Optionally draw circles at each joint */}
          {Object.values(detectedThinksysLandmarks).map((landmark, index) => {
            const MIN_DRAW_VISIBILITY = 0.5; 
            if (landmark && (landmark.visibility === undefined || landmark.visibility > MIN_DRAW_VISIBILITY)) {
              return (
                <Circle
                  key={`circle-${index}`}
                  cx={landmark.x * width}
                  cy={landmark.y * height}
                  r="5" 
                  fill="yellow" 
                />
              );
            }
            return null;
          })}
        </Svg>
      )}

      {/* UI Overlay for Reps and Feedback (TOP SECTION) */}
      <View style={styles.overlay}>
        {/* Person Detection Status */}
        <Text style={isPersonDetected ? styles.personFoundText : styles.personNotFoundText}>
          {isPersonDetected ? 'Person Found!' : 'Detecting Person...'}
        </Text>

        <Text style={styles.repCounter}>Squats: {currentReps}</Text>
        <Text style={styles.feedbackText}>{currentFeedback}</Text>

        {/* Reset Counter Button */}
        <View style={styles.resetButtonContainer}> 
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              const { repCount, feedback } = resetCounter();
              setCurrentReps(repCount);
              setCurrentFeedback(feedback);
              setIsPersonDetected(false); 
              setDetectedThinksysLandmarks(null); // Clear drawing on reset
            }}
          >
            <Text style={styles.buttonText}>Reset Counter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Container for Switch Camera Button (BOTTOM SECTION) */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.switchCameraButton}
          onPress={toggleCameraFacing}
        >
          <Text style={styles.buttonText}>Switch Camera ({cameraFacingText})</Text>
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
    top: Platform.OS === 'ios' ? 60 : 20,
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  personFoundText: {
    fontSize: 22,
    color: 'lime',
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  personNotFoundText: {
    fontSize: 22,
    color: '#FF4500',
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
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
    color: '#FFD700',
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  resetButtonContainer: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  switchCameraButton: {
    backgroundColor: '#5856D6',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;