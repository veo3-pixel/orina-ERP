
# 📱 How to Build Android APK (Step-by-Step)

This guide explains how to convert this web app into an Android APK using Capacitor and npm commands.

## Prerequisites
1.  **Node.js** installed on your computer.
2.  **Android Studio** installed (required for the final build).

---

## Step 1: Initialize Capacitor
Open your terminal (Command Prompt or Terminal) in the project folder and run:

```bash
# Install Capacitor core and cli
npm install @capacitor/core
npm install -D @capacitor/cli

# Initialize Capacitor (Press Enter to accept defaults or name your app)
npx cap init
```

---

## Step 2: Install Android Platform
Add the Android platform to your project:

```bash
# Install Android library
npm install @capacitor/android

# Add the android folder to your project
npx cap add android
```

---

## Step 3: Build the Web Assets
Before syncing with Android, you must build the React app:

```bash
# This creates the 'dist' folder with your app code
npm run build
```

*Note: If you see an error about `dist` missing later, make sure your `capacitor.config.json` has `"webDir": "dist"`.*

---

## Step 4: Sync to Android
Copy your web build into the Android native project:

```bash
npx cap sync
```

---

## Step 5: Open in Android Studio
Open the project in Android Studio to create the APK:

```bash
npx cap open android
```

### Inside Android Studio:
1.  Wait for Gradle sync to finish (bottom bar).
2.  Go to **Build** menu > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3.  Once finished, a popup will appear at the bottom right. Click **locate** to find your `.apk` file.
4.  Transfer this APK to your phone and install it!

---

## 🔄 Updating the App
If you make changes to your code (like changing text or colors), follow these steps to update the app:

1.  `npm run build`
2.  `npx cap sync`
3.  `npx cap open android` -> Run/Build again.
