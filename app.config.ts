// app.config.ts
import { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'MyAIFitnessTrainer',
  slug: 'myaifitnesstrainer',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.myaifitnesstrainer', // IMPORTANT: CUSTOMIZE THIS! e.g., "com.tangysaurus.aifitnesstrainer"
    infoPlist: {
      NSCameraUsageDescription: 'This app needs camera access to track your exercise movements.',
      // Add Microphone permission for Vision Camera, for video processing
      NSMicrophoneUsageDescription: 'This app needs microphone access for video processing.', 
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/icon.png', // Or your actual adaptive-icon.png
      backgroundColor: '#ffffff'
    },
    package: 'com.yourcompany.myaifitnesstrainer', // IMPORTANT: CUSTOMIZE THIS! e.g., "com.tangysaurus.aifitnesstrainer"
    permissions: [
      "android.permission.CAMERA",
      // Add Microphone permission for Vision Camera
      "android.permission.RECORD_AUDIO" 
    ]
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      "react-native-vision-camera", // This plugin is essential for the Camera component
      {
        "cameraPermissionText": "$(PRODUCT_NAME) needs access to your Camera.",
        "enableMicrophonePermission": true 
      }
    ],
    // The @thinksys/react-native-mediapipe library does not list an Expo plugin in its package.json.
    // We assume autolinking is sufficient. No direct plugin entry needed here for it.
    
    "expo-router",
    [
      "expo-splash-screen",
      {
        "image": "./assets/images/splash-icon.png",
        "imageWidth": 200,
        "resizeMode": "contain",
        "backgroundColor": "#ffffff"
      }
    ],
  ],
});