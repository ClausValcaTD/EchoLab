import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore with multi-tab offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const storage = getStorage(app);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOut = () => firebaseSignOut(auth);

// ── Firestore helpers ─────────────────────────────────────────────────────────

/** Save or overwrite a project for the current user */
export async function saveCloudProject(
  uid: string,
  projectData: {
    name: string;
    effects: object;
    playlists: object[];
    metadata: object | null;
    duration?: number;
  }
) {
  const projectsRef = collection(db, 'users', uid, 'projects');
  const docRef = await addDoc(projectsRef, {
    ...projectData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/** List all cloud projects for a user, newest first */
export async function listCloudProjects(uid: string) {
  const projectsRef = collection(db, 'users', uid, 'projects');
  const q = query(projectsRef, orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }));
}

/** Delete a cloud project */
export async function deleteCloudProject(uid: string, projectId: string) {
  await deleteDoc(doc(db, 'users', uid, 'projects', projectId));
}

/** Share current effects as a public preset; returns the preset ID */
export async function sharePreset(
  uid: string,
  presetName: string,
  effects: object
) {
  const presetsRef = collection(db, 'sharedPresets');
  const docRef = await addDoc(presetsRef, {
    name: presetName,
    effects,
    authorUid: uid,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ── Storage helpers ───────────────────────────────────────────────────────────

/** Upload an audio blob to /users/{uid}/audio/{filename}; returns the download URL */
export async function uploadAudioFile(
  uid: string,
  filename: string,
  blob: Blob
): Promise<string> {
  const storageRef = ref(storage, `users/${uid}/audio/${filename}`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
