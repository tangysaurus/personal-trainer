// utils/poseUtils.ts

// Define a type for a landmark point for clarity (from @thinksys/react-native-mediapipe)
export interface ThinksysLandmark {
  x: number;
  y: number;
  z?: number; // Z-coordinate might be available
  visibility?: number; // Confidence score, often 0-1
}

// Define the structure of the pose detection result (from @thinksys/react-native-mediapipe)
// This interface explicitly lists the *lowercase_snake_case* keys that are expected.
export interface ThinksysPoseLandmarks {
  nose?: ThinksysLandmark;
  left_eye_inner?: ThinksysLandmark;
  left_eye?: ThinksysLandmark;
  left_eye_outer?: ThinksysLandmark;
  right_eye_inner?: ThinksysLandmark;
  right_eye?: ThinksysLandmark;
  right_eye_outer?: ThinksysLandmark;
  left_ear?: ThinksysLandmark;
  right_ear?: ThinksysLandmark;
  mouth_left?: ThinksysLandmark;
  mouth_right?: ThinksysLandmark;
  left_shoulder?: ThinksysLandmark;
  right_shoulder?: ThinksysLandmark;
  left_elbow?: ThinksysLandmark;
  right_elbow?: ThinksysLandmark;
  left_wrist?: ThinksysLandmark;
  right_wrist?: ThinksysLandmark;
  left_pinky?: ThinksysLandmark;
  right_pinky?: ThinksysLandmark;
  left_index?: ThinksysLandmark;
  right_index?: ThinksysLandmark;
  left_thumb?: ThinksysLandmark;
  right_thumb?: ThinksysLandmark;
  left_hip?: ThinksysLandmark;
  right_hip?: ThinksysLandmark;
  left_knee?: ThinksysLandmark;
  right_knee?: ThinksysLandmark;
  left_ankle?: ThinksysLandmark;
  right_ankle?: ThinksysLandmark;
  left_heel?: ThinksysLandmark;
  right_heel?: ThinksysLandmark;
  left_foot_index?: ThinksysLandmark;
  right_foot_index?: ThinksysLandmark;
}

// Map string names to a constant for easier use in connections.
// The VALUES of these properties must match the *actual keys* from the library's output.
// These are now lowercase, snake_case as expected from MediaPipe-like libraries.
export const ThinksysLandmarkNames = {
  NOSE: 'nose',
  LEFT_EYE: 'left_eye',
  RIGHT_EYE: 'right_eye',
  LEFT_EAR: 'left_ear',
  RIGHT_EAR: 'right_ear',
  LEFT_SHOULDER: 'left_shoulder',
  RIGHT_SHOULDER: 'right_shoulder',
  LEFT_ELBOW: 'left_elbow',
  RIGHT_ELBOW: 'right_elbow',
  LEFT_WRIST: 'left_wrist',
  RIGHT_WRIST: 'right_wrist',
  LEFT_HIP: 'left_hip',
  RIGHT_HIP: 'right_hip',
  LEFT_KNEE: 'left_knee',
  RIGHT_KNEE: 'right_knee',
  LEFT_ANKLE: 'left_ankle',
  RIGHT_ANKLE: 'right_ankle',
  LEFT_HEEL: 'left_heel',
  RIGHT_HEEL: 'right_heel',
  LEFT_FOOT_INDEX: 'left_foot_index',
  RIGHT_FOOT_INDEX: 'right_foot_index',
  // You might also have inner/outer eye, mouth etc. if the library provides them
  LEFT_EYE_INNER: 'left_eye_inner',
  LEFT_EYE_OUTER: 'left_eye_outer',
  RIGHT_EYE_INNER: 'right_eye_inner',
  RIGHT_EYE_OUTER: 'right_eye_outer',
  MOUTH_LEFT: 'mouth_left',
  MOUTH_RIGHT: 'mouth_right',
} as const;

// Define a type for the keys of ThinksysLandmarkNames, which are the UPPERCASE_SNAKE_CASE names
type LandmarkNameKey = keyof typeof ThinksysLandmarkNames;
// Define a type for the VALUES of ThinksysLandmarkNames, which are the lowercase_snake_case strings
type LandmarkNameValue = typeof ThinksysLandmarkNames[keyof typeof ThinksysLandmarkNames];


// Define connections using the *VALUES* (lowercase_snake_case strings) from ThinksysLandmarkNames
export const POSE_CONNECTIONS: [LandmarkNameValue, LandmarkNameValue][] = [
  // Torso
  [ThinksysLandmarkNames.LEFT_SHOULDER, ThinksysLandmarkNames.RIGHT_SHOULDER],
  [ThinksysLandmarkNames.LEFT_SHOULDER, ThinksysLandmarkNames.LEFT_HIP],
  [ThinksysLandmarkNames.RIGHT_SHOULDER, ThinksysLandmarkNames.RIGHT_HIP],
  [ThinksysLandmarkNames.LEFT_HIP, ThinksysLandmarkNames.RIGHT_HIP],

  // Left Arm
  [ThinksysLandmarkNames.LEFT_SHOULDER, ThinksysLandmarkNames.LEFT_ELBOW],
  [ThinksysLandmarkNames.LEFT_ELBOW, ThinksysLandmarkNames.LEFT_WRIST],

  // Right Arm
  [ThinksysLandmarkNames.RIGHT_SHOULDER, ThinksysLandmarkNames.RIGHT_ELBOW],
  [ThinksysLandmarkNames.RIGHT_ELBOW, ThinksysLandmarkNames.RIGHT_WRIST],

  // Left Leg
  [ThinksysLandmarkNames.LEFT_HIP, ThinksysLandmarkNames.LEFT_KNEE],
  [ThinksysLandmarkNames.LEFT_KNEE, ThinksysLandmarkNames.LEFT_ANKLE],

  // Right Leg
  [ThinksysLandmarkNames.RIGHT_HIP, ThinksysLandmarkNames.RIGHT_KNEE],
  [ThinksysLandmarkNames.RIGHT_KNEE, ThinksysLandmarkNames.RIGHT_ANKLE],

  // Head/Face (Basic connections)
  [ThinksysLandmarkNames.NOSE, ThinksysLandmarkNames.LEFT_EYE],
  [ThinksysLandmarkNames.NOSE, ThinksysLandmarkNames.RIGHT_EYE],
  [ThinksysLandmarkNames.LEFT_EYE, ThinksysLandmarkNames.LEFT_EAR],
  [ThinksysLandmarkNames.RIGHT_EYE, ThinksysLandmarkNames.RIGHT_EAR],
  [ThinksysLandmarkNames.LEFT_SHOULDER, ThinksysLandmarkNames.NOSE], // Neck connection (approx)
  [ThinksysLandmarkNames.RIGHT_SHOULDER, ThinksysLandmarkNames.NOSE], // Neck connection (approx)
  // Feet
  [ThinksysLandmarkNames.LEFT_ANKLE, ThinksysLandmarkNames.LEFT_HEEL],
  [ThinksysLandmarkNames.LEFT_HEEL, ThinksysLandmarkNames.LEFT_FOOT_INDEX],
  [ThinksysLandmarkNames.RIGHT_ANKLE, ThinksysLandmarkNames.RIGHT_HEEL],
  [ThinksysLandmarkNames.RIGHT_HEEL, ThinksysLandmarkNames.RIGHT_FOOT_INDEX],
];

// Helper to find a landmark by its actual string name from the object
export const findLandmark = (landmarks: ThinksysPoseLandmarks, name: LandmarkNameValue): ThinksysLandmark | undefined => {
  // We need to cast `name` to `keyof ThinksysPoseLandmarks` because TypeScript's
  // strictness with string literal types vs index signatures.
  return landmarks[name as keyof ThinksysPoseLandmarks];
};