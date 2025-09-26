# GEMINI.md

## Project Overview

This project, "Campus Recharge," is a mobile application developed using React Native and Expo. It is designed to help university students find suitable resting spots on campus based on their class schedules and current location. The application provides real-time information on crowding, noise levels, and available amenities like power outlets.

The project is well-documented, with a detailed Product Requirements Document (`docs/PRD.md`) and a 4-week MVP development roadmap (`docs/MVP_Development_Roadmap.md`).

The frontend is a TypeScript-based React Native application using Expo Router for navigation. The backend is planned to be built on Firebase or Supabase, providing user authentication, a database for rest spots, and check-in functionality.

## Building and Running

The application can be run on Android, iOS, and web platforms. The following scripts are available in `app/package.json`:

*   `pnpm start`: Starts the Expo development server.
*   `pnpm run android`: Runs the app on a connected Android device or emulator.
*   `pnpm run ios`: Runs the app on an iOS simulator or device.
*   `pnpm run web`: Runs the app in a web browser.

**To get started:**

1.  Navigate to the `app` directory: `cd app`
2.  Install dependencies: `pnpm install`
3.  Run one of the scripts above.

## Development Conventions

*   **Language:** TypeScript
*   **Framework:** React Native with Expo
*   **Package Manager:** `pnpm` should be used for all dependency management.
*   **Styling:** A consistent color scheme is defined in `constants/Colors.ts`.
*   **Linting and Formatting:** The project is set up with ESLint and Prettier to enforce a consistent coding style.
*   **Folder Structure:** The project follows the standard Expo project structure. Source code is located in the `app/app` directory, with components in `app/components` and constants in `app/constants`.
*   **Navigation:** Navigation is handled by `expo-router`. The main navigation is a tab-based layout defined in `app/app/(tabs)/_layout.tsx`.
*   **General Principles:** Development should adhere to the general software engineering principles outlined in `rules/projectrules2.txt`, focusing on clarity, simplicity, robustness, and security.