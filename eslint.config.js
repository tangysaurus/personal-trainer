// https://docs.expo.dev/guides/using-eslint/
/**const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);**/


import expoConfig from 'eslint-config-expo/flat';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/lib/eslint.js'; // Note: Use 'eslint/lib/eslint.js' for defineConfig
import globals from 'globals';

// Path to your tsconfig.json relative to the project root
const tsconfigPath = './tsconfig.json'; 

export default defineConfig([
  // Base Expo configuration (provides React Native specific rules, JSX, etc.)
  expoConfig,

  // Integration with Prettier for formatting
  eslintPluginPrettierRecommended,

  // TypeScript-specific configuration
  {
    // Apply this configuration to TypeScript files
    files: ['**/*.ts', '**/*.tsx'],
    
    // Language options for TypeScript files
    languageOptions: {
      parser: '@typescript-eslint/parser', // Use the TypeScript parser
      parserOptions: {
        project: tsconfigPath, // Tell ESLint where your tsconfig.json is for type-aware linting
        ecmaVersion: 'latest', // Support latest ECMAScript features
        sourceType: 'module',  // Use ES Modules
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
      },
      // Define globals for React Native environment
      globals: {
        ...globals.browser, // Standard browser globals
        ...globals.es2021,  // ES2021 globals
        '__DEV__': 'readonly', // Expo specific global
      },
    },
    
    // Add TypeScript specific plugins and rules
    plugins: {
      '@typescript-eslint': {
        rules: {}, // Rules will come from 'extends'
      },
      'react': {}, // React rules
      'react-native': {}, // React Native specific rules
      'import': {}, // Import rules
      'prettier': {}, // Prettier plugin
    },
    
    extends: [
      'eslint:recommended', // ESLint's recommended rules
      'plugin:@typescript-eslint/recommended', // TypeScript recommended rules
      'plugin:@typescript-eslint/recommended-requiring-type-checking', // Type-aware rules (requires parserOptions.project)
      'plugin:react/recommended', // React recommended rules
      'plugin:react-hooks/recommended', // React Hooks recommended rules
      'plugin:react-native/all', // All React Native specific rules
      'plugin:import/recommended', // Import rules recommended
    ],
    
    rules: {
      // Custom rules or overrides for TypeScript files
      'no-unused-vars': 'off', // Turn off base ESLint rule, use TS specific one
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'prettier/prettier': 'warn', // Treat Prettier issues as warnings, not errors
      'react/react-in-jsx-scope': 'off', // Not needed for new React versions (JSX transform)
      'react/jsx-uses-react': 'off', // Not needed for new React versions
      'react/prop-types': 'off', // Often turned off in TypeScript projects as types handle it
      '@typescript-eslint/no-var-requires': 'off', // Allow require() for modules like babel.config.js
    },
    settings: {
      react: {
        version: 'detect', // Auto-detect React version
      },
      'import/resolver': {
        typescript: {
          project: tsconfigPath, // For import resolution with TypeScript paths
        },
      },
    },
  },

  // Configuration for JavaScript files (e.g., config files, utility files)
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Node.js globals for config files
        __DEV__: 'readonly',
      },
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:react-native/all',
      'plugin:import/recommended',
    ],
    rules: {
      'prettier/prettier': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Ignore files (similar to .eslintignore)
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.expo/',
      '.expo-shared/',
      'android/',
      'ios/',
      'web-build/',
    ],
  },
]);