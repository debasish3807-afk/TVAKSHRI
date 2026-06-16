
import { useState, useEffect, useCallback, useContext, createContext } from "react";
import type { ReactNode } from "react";
import { createElement } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    username:
      user.user_metadata?.username ||
      user.user_metadata?.full_name ||
      user.email!.split("@")[0],
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((authUser: AuthUser) => {
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Safety #1: check existing session on page load / refresh
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session?.user) login(mapSupabaseUser(session.user));
      if (mounted) setLoading(false);
    });

    // Safety #2: listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        login(mapSupabaseUser(session.user));
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        logout();
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        login(mapSupabaseUser(session.user));
      } else if (event === "PASSWORD_RECOVERY") {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // The original error message "Definition for rule 'react-hooks/exhaustive-deps' was not found"
    // indicates an ESLint configuration issue, not a syntax error in the code itself.
    // Given the role is to fix "syntax errors" and preserve original code as much as possible,
    // and the error itself is about the *definition* of an ESLint rule, not the code's compliance
    // with that rule, the most minimal and targeted change is to remove the ESLint directive
    // that's causing the problem. The `login` and `logout` functions are already wrapped
    // in `useCallback` with empty dependency arrays, meaning they are stable and
    // do not need to be included in the `useEffect` dependency array from a React perspective.
    // Removing the `eslint-disable-next-line` comment resolves the direct error
    // without altering the functional logic or introducing new potential issues.
  }, []);

  return createElement(AuthContext.Provider, { value: { user, loading, login, logout } }, children);
}

export function useAuth() {
  return useContext(AuthContext);
}
