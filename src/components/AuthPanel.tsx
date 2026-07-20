import { useFirebase } from '../hooks/useFirebase';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

/** Compact sign-in/avatar widget for the TopBar */
export function AuthPanel() {
  const { user, authLoading, login, logout } = useFirebase();

  if (authLoading) {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 group">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? 'User'}
            className="w-7 h-7 rounded-full border border-white/20 ring-2 ring-primary/30"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">
            {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
          </div>
        )}
        <span className="text-xs text-muted-foreground hidden lg:block max-w-[100px] truncate">
          {user.displayName ?? user.email}
        </span>
        <button
          onClick={logout}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 px-3 py-1.5 rounded-full transition-all text-muted-foreground hover:text-white"
    >
      <LogIn className="w-3.5 h-3.5" />
      Sign in
    </button>
  );
}
