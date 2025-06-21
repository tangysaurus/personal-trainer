// utils/exerciseAnalyzer.ts

// Define a type for a landmark point for clarity
interface Landmark {
  x: number;
  y: number;
  z?: number; // Z-coordinate might be available depending on the model
  visibility?: number; // Confidence score, often 0-1
}

// Define a type for the landmarks object expected from the MediaPipe library
interface PoseLandmarks {
  left_hip: Landmark;
  left_knee: Landmark;
  left_ankle: Landmark;
  right_hip: Landmark;
  right_knee: Landmark;
  right_ankle: Landmark;
  // ... other landmarks would be here if needed for other exercises or more complex form checks
}

// State variables for squat tracking
let squatState: 'up' | 'down' = 'up';
let repCount: number = 0;
let feedback: string = '';

/**
 * Calculates the angle between three points (p1-p2-p3) with p2 as the vertex.
 * Points should have x and y properties.
 * This is a 2D angle calculation. For more precise 3D analysis, you'd use Z-coordinates.
 */
const calculateAngle = (p1: Landmark, p2: Landmark, p3: Landmark): number => {
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
 * Analyzes the pose landmarks to track squat repetitions and provide feedback.
 * @param {PoseLandmarks} landmarks - An object containing landmark data (e.g., from @thinksys/react-native-mediapipe).
 * Expected keys: 'left_hip', 'left_knee', 'left_ankle',
 * 'right_hip', 'right_knee', 'right_ankle'.
 */
export const analyzeSquat = (landmarks: PoseLandmarks): { repCount: number; feedback: string } => {
  // IMPORTANT: Verify the exact structure of `landmarks` from @thinksys/react-native-mediapipe documentation.
  // It usually provides an object with named properties like 'left_hip', 'left_knee', etc.
  // If it's an array, you'll need to map indices to names (e.g., landmarks[23] for left_hip)
  // or adjust the `PoseLandmarks` interface accordingly.

  const leftHip = landmarks.left_hip;
  const leftKnee = landmarks.left_knee;
  const leftAnkle = landmarks.left_ankle;

  const rightHip = landmarks.right_hip;
  const rightKnee = landmarks.right_knee;
  const rightAnkle = landmarks.right_ankle;

  // Basic check if critical landmarks are visible
  // We check for `!undefined` or `!null`. A landmark might exist but have low visibility.
  if (
    !leftHip || !leftKnee || !leftAnkle ||
    !rightHip || !rightKnee || !rightAnkle ||
    (leftKnee.visibility && leftKnee.visibility < 0.6) || // Example visibility check
    (rightKnee.visibility && rightKnee.visibility < 0.6)
  ) {
    feedback = "Adjust camera: Can't see all body parts clearly!";
    return { repCount, feedback };
  }

  // Calculate knee angles for both legs
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

  // Use the average or minimum of the two knee angles for squat depth
  const kneeAngle = Math.min(leftKneeAngle, rightKneeAngle); // Or `(leftKneeAngle + rightKneeAngle) / 2;`

  // --- Squat Logic Thresholds ---
  const SQUAT_DOWN_THRESHOLD = 100; // Angle when hip is below knee (e.g., 90-100 degrees for a deep squat)
  const SQUAT_UP_THRESHOLD = 160;   // Angle when standing up (e.g., 160-170 degrees, close to straight leg)

  // State machine for rep counting
  if (squatState === 'up' && kneeAngle < SQUAT_DOWN_THRESHOLD) {
    // Transition from 'up' to 'down'
    squatState = 'down';
    feedback = "Go deeper!";
  } else if (squatState === 'down' && kneeAngle > SQUAT_UP_THRESHOLD) {
    // Transition from 'down' to 'up' - a complete rep
    repCount++;
    squatState = 'up';
    feedback = "Good rep!";
  } else if (squatState === 'up') {
    // User is in the 'up' position, ready for next rep
    feedback = "Ready to squat!";
  } else if (squatState === 'down') {
    // User is in the 'down' position, check for depth
    if (kneeAngle > SQUAT_DOWN_THRESHOLD + 10) { // If not deep enough
      feedback = "Lower! Lower!";
    } else {
      feedback = "Hold it!"; // User is holding the deep squat position
    }
  }

  // You can add more complex form correction here, e.g.:
  // - Checking back straightness (angle between shoulder, hip, knee)
  // - Checking knee tracking (knee position relative to ankle/foot)
  // - Checking hip hinge (hip movement relative to knee)

  // *** FIX: Add a default return at the end of the function ***
  // This ensures all code paths return a value, satisfying TypeScript.
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