import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isDriver: boolean;
  isLoading: boolean;
  rolesLoaded: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  const checkUserRoles = async (userId: string): Promise<{ admin: boolean; driver: boolean }> => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      const roles = (data || []).map((r) => r.role);
      return {
        admin: roles.includes("admin"),
        driver: roles.includes("driver"),
      };
    } catch (error) {
      console.error("Error checking user roles:", error);
      return { admin: false, driver: false };
    }
  };

  useEffect(() => {
    let mounted = true;
    let roleFetchToken = 0;

    const applySession = (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    };

    const fetchAndApplyRoles = async (userId: string) => {
      const currentToken = ++roleFetchToken;
      try {
        const roles = await checkUserRoles(userId);
        if (!mounted || currentToken !== roleFetchToken) return;
        setIsAdmin(roles.admin);
        setIsDriver(roles.driver);
      } catch {
        if (!mounted || currentToken !== roleFetchToken) return;
        setIsAdmin(false);
        setIsDriver(false);
      } finally {
        if (mounted && currentToken === roleFetchToken) setRolesLoaded(true);
      }
    };

    // 1) Subscribe first (callback MUST be sync)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      // reset role state immediately on any auth change
      setRolesLoaded(false);
      applySession(nextSession);

      if (nextSession?.user) {
        // Defer role lookup to avoid calling supabase inside the auth callback
        setTimeout(() => {
          fetchAndApplyRoles(nextSession.user.id);
        }, 0);
      } else {
        // Signed out
        setIsAdmin(false);
        setIsDriver(false);
        setRolesLoaded(true);
      }
    });

    // 2) Then get the current session
    (async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        applySession(currentSession);

        if (currentSession?.user) {
          await fetchAndApplyRoles(currentSession.user.id);
        } else {
          setIsAdmin(false);
          setIsDriver(false);
          setRolesLoaded(true);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setIsAdmin(false);
          setIsDriver(false);
          setRolesLoaded(true);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName }
      }
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsDriver(false);
      setRolesLoaded(true);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isDriver, isLoading, rolesLoaded, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
