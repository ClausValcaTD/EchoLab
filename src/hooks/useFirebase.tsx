import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';
import {
  auth,
  signInWithGoogle,
  signOut,
  saveCloudProject,
  listCloudProjects,
  deleteCloudProject,
  sharePreset as fbSharePreset,
  uploadAudioFile,
} from '../firebase';

export type CloudProject = {
  id: string;
  name: string;
  effects: object;
  playlists: object[];
  metadata: object | null;
  duration?: number;
  createdAt?: { seconds: number };
  updatedAt?: { seconds: number };
};

type FirebaseContextType = {
  user: User | null;
  authLoading: boolean;
  cloudProjects: CloudProject[];
  cloudLoading: boolean;

  login: () => Promise<void>;
  logout: () => Promise<void>;

  saveToCloud: (data: {
    name: string;
    effects: object;
    playlists: object[];
    metadata: object | null;
    duration?: number;
  }) => Promise<void>;

  refreshCloudProjects: () => Promise<void>;
  deleteFromCloud: (projectId: string) => Promise<void>;

  sharePreset: (name: string, effects: object) => Promise<string | null>;
  uploadAudio: (filename: string, blob: Blob) => Promise<string | null>;
};

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cloudProjects, setCloudProjects] = useState<CloudProject[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);

  // Watch auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Auto-load cloud projects when user signs in
  useEffect(() => {
    if (user) {
      refreshCloudProjects();
    } else {
      setCloudProjects([]);
    }
  }, [user]);

  const login = useCallback(async () => {
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Sign-in failed: ' + (err.message ?? 'unknown error'));
      }
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    toast.success('Signed out');
  }, []);

  const refreshCloudProjects = useCallback(async () => {
    if (!user) return;
    setCloudLoading(true);
    try {
      const projects = await listCloudProjects(user.uid);
      setCloudProjects(projects as CloudProject[]);
    } catch (err) {
      console.error('Failed to load cloud projects', err);
    } finally {
      setCloudLoading(false);
    }
  }, [user]);

  const saveToCloud = useCallback(
    async (data: {
      name: string;
      effects: object;
      playlists: object[];
      metadata: object | null;
      duration?: number;
    }) => {
      if (!user) {
        toast.error('Sign in to save to the cloud');
        return;
      }
      try {
        await saveCloudProject(user.uid, data);
        await refreshCloudProjects();
        toast.success('Saved to cloud ☁️');
      } catch (err) {
        console.error(err);
        toast.error('Cloud save failed');
      }
    },
    [user, refreshCloudProjects]
  );

  const deleteFromCloud = useCallback(
    async (projectId: string) => {
      if (!user) return;
      try {
        await deleteCloudProject(user.uid, projectId);
        await refreshCloudProjects();
        toast.success('Deleted from cloud');
      } catch (err) {
        console.error(err);
        toast.error('Delete failed');
      }
    },
    [user, refreshCloudProjects]
  );

  const sharePreset = useCallback(
    async (name: string, effects: object): Promise<string | null> => {
      if (!user) {
        toast.error('Sign in to share presets');
        return null;
      }
      try {
        const id = await fbSharePreset(user.uid, name, effects);
        const link = `${window.location.origin}${import.meta.env.BASE_URL}?preset=${id}`;
        await navigator.clipboard.writeText(link);
        toast.success('Preset link copied to clipboard!');
        return id;
      } catch (err) {
        console.error(err);
        toast.error('Failed to share preset');
        return null;
      }
    },
    [user]
  );

  const uploadAudio = useCallback(
    async (filename: string, blob: Blob): Promise<string | null> => {
      if (!user) {
        toast.error('Sign in to upload audio');
        return null;
      }
      try {
        const url = await uploadAudioFile(user.uid, filename, blob);
        toast.success('Audio uploaded to cloud ☁️');
        return url;
      } catch (err) {
        console.error(err);
        toast.error('Upload failed');
        return null;
      }
    },
    [user]
  );

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authLoading,
        cloudProjects,
        cloudLoading,
        login,
        logout,
        saveToCloud,
        refreshCloudProjects,
        deleteFromCloud,
        sharePreset,
        uploadAudio,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error('useFirebase must be used within a FirebaseProvider');
  return ctx;
}
