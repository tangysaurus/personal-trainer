// utils/exerciseAnalyzer.ts

import { ThinksysLandmark, ThinksysLandmarkNames, ThinksysPoseLandmarks, findLandmark } from './poseUtils';

// State variables for squat tracking
let squatState: 'up' | 'down' = 'up';
let repCount: number = 0;
let feedback: string = '';

/**
 * Calculates the angle between three points (p1-p2-p3) with p2 as the vertex.
 * Points should have x and y properties.
 */
const calculateAngle = (p1: ThinksysLandmark, p2: ThinksysLandmark, p3: ThinksysLandmark): number => {
  const p1x = p1.x; const p1y = p1.y;
  const p2x = p2.x; const p2y = p2.y;
  const p3x = p3.x; const p3y = p3.y;

  const angleRad = Math.atan2(p3y - p2y, p3x - p2x) - Math.atan2(p1y - p2y, p1x - p2x);
  let angleDeg = Math.abs(angleRad * 180.0 / Math.PI);

  if (angleDeg > 180) {
    angleDeg = 360 - angleDeg;
  }
  return angleDeg;
};

/**
 * Analyzes the @thinksys/react-native-mediapipe pose landmarks to track squat repetitions.
 * @param {ThinksysPoseLandmarks} landmarks - An object of landmark objects.
 */
export const analyzeSquat = (landmarks: ThinksysPoseLandmarks): { repCount: number; feedback: string } => {
  // Find the specific landmarks needed for squat analysis using the helper
  const leftHip = findLandmark(landmarks, ThinksysLandmarkNames.LEFT_HIP);
  const leftKnee = findLandmark(landmarks, ThinksysLandmarkNames.LEFT_KNEE);
  const leftAnkle = findLandmark(landmarks, ThinksysLandmarkNames.LEFT_ANKLE);

  const rightHip = findLandmark(landmarks, ThinksysLandmarkNames.RIGHT_HIP);
  const rightKnee = findLandmark(landmarks, ThinksysLandmarkNames.RIGHT_KNEE);
  const rightAnkle = findLandmark(landmarks, ThinksysLandmarkNames.RIGHT_ANKLE);

  // Basic check if critical landmarks are visible and have high likelihood
  const MIN_VISIBILITY = 0.7; // Adjust this threshold as needed
  if (
    !leftHip || !leftKnee || !leftAnkle ||
    !rightHip || !rightKnee || !rightAnkle ||
    (leftHip.visibility && leftHip.visibility < MIN_VISIBILITY) ||
    (leftKnee.visibility && leftKnee.visibility < MIN_VISIBILITY) ||
    (leftAnkle.visibility && leftAnkle.visibility < MIN_VISIBILITY) ||
    (rightHip.visibility && rightHip.visibility < MIN_VISIBILITY) ||
    (rightKnee.visibility && rightKnee.visibility < MIN_VISIBILITY) ||
    (rightAnkle.visibility && rightAnkle.visibility < MIN_VISIBILITY)
  ) {
    feedback = "Adjust camera: Can't see all body parts clearly!";
    return { repCount, feedback };
  }

  // Calculate knee angles for both legs
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

  // Use the average of the two knee angles for squat depth
  const kneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

  // --- Squat Logic Thresholds ---
  const SQUAT_DOWN_THRESHOLD = 100; // Angle when hip is below knee (e.g., 90-100 degrees for a deep squat)
  const SQUAT_UP_THRESHOLD = 160;   // Angle when standing up (e.g., 160-170 degrees, close to straight leg)

  // State machine for rep counting
  if (squatState === 'up' && kneeAngle < SQUAT_DOWN_THRESHOLD) {
    squatState = 'down';
    feedback = "Go deeper!";
  } else if (squatState === 'down' && kneeAngle > SQUAT_UP_THRESHOLD) {
    repCount++;
    squatState = 'up';
    feedback = "Good rep!";
  } else if (squatState === 'up') {
    feedback = "Ready to squat!";
  } else if (squatState === 'down') {
    if (kneeAngle > SQUAT_DOWN_THRESHOLD + 10) { 
      feedback = "Lower! Lower!";
    } else {
      feedback = "Hold it!"; 
    }
  }

  return { repCount, feedback };
};

/**
 * Resets the squat counter and state.
 */
export const resetCounter = (): { repCount: number; feedback: string } => {
  repCount = 0;
  squatState = 'up';
  feedback = 'Counter Reset!';
  return { repCount, feedback };
};