# EchoLab v3

> A free, browser-based professional audio studio built with React + Web Audio API + Firebase.

![EchoLab](https://img.shields.io/badge/EchoLab-v3-00d4ff?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase-10-ffca28?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## Features

- **Studio** — Waveform editor (trim / cut / reverse / normalize / loop regions), 11 real-time effects, 7 presets, drag-and-drop upload, URL streaming, metadata parsing
- **Mixer** — Multi-track lanes with per-track gain, pan, mute/solo, mic recording
- **Parametric EQ** — 5-band interactive canvas EQ with draggable nodes
- **Compressor / Limiter** — DynamicsCompressorNode with visual feedback
- **Pro Visualizer** — Spectrogram, oscilloscope, LUFS loudness meter, phase correlation
- **AI Lab** — Auto-mastering, BPM detection, frequency-band stem separation
- **Projects** — Local (IndexedDB) and Cloud (Firestore) project save/load
- **Export** — WAV (lossless), MP3 (320 kbps via lamejs), OGG; batch ZIP; cloud upload to Firebase Storage
- **Share Presets** — Publish effect chains as public Firestore presets with a shareable link
- **Auth** — Google Sign-In via Firebase Authentication
- **Keyboard Shortcuts** — Space, L, R, S, 1–7, Ctrl+Z/Y, ←/→, M, and more
- **MIDI** — Web MIDI API CC binding with Learn mode
- **Offline** — Firestore multi-tab persistent local cache

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 7 |
| Audio | Web Audio API, OfflineAudioContext, MediaRecorder |
| Styling | Tailwind CSS, Radix UI |
| Auth | Firebase Authentication (Google) |
| Database | Cloud Firestore (with offline persistence) |
| Storage | Firebase Storage |
| Encoding | lamejs (MP3), jszip (batch) |
| Metadata | music-metadata-browser |
| State | React Context + IndexedDB (idb) |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/M5Develop/EchoLab.git
cd EchoLab
npm install   # or: pnpm install
```

### 2. Configure Firebase

```bash
cp .env.example .env
```

Edit `.env` with your real Firebase values (see [Firebase Console → Project Settings](https://console.firebase.google.com)):

```env
VITE_FIREBASE_API_KEY=AIzaSy_your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=1:your_sender_id:web:your_app_id
```

> ⚠️ **Never commit `.env`** — it is already listed in `.gitignore`.

### 3. Enable Firebase services

In [Firebase Console](https://console.firebase.google.com) for your project:

1. **Authentication** → Sign-in method → Enable **Google**
2. **Authentication** → Settings → Authorized domains → Add your domain
3. **Firestore Database** → Create database (production mode)
4. **Storage** → Get started

### 4. Deploy security rules

**Firestore rules** (`firestore.rules`):

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only access their own data
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // Shared presets: authenticated write, public read
    match /sharedPresets/{presetId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
        && request.auth.uid == resource.data.authorUid;
    }
  }
}
```

**Storage rules** (`storage.rules`):

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /users/{uid}/audio/{filename} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Deploy via Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,storage
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

All variables are prefixed `VITE_` so Vite injects them at build time. No backend server holds secrets — all auth is handled by Firebase SDK directly in the browser.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `S` | Stop |
| `L` | Toggle loop region |
| `R` | Start/stop mic recording |
| `M` | Mute / Unmute |
| `1` – `7` | Apply preset |
| `Ctrl+Z` / `Ctrl+Y` | Undo / Redo |
| `←` / `→` | Seek ±5 seconds |

---

## License

MIT © M5Develop
