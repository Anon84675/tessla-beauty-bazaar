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

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const roles = await checkUserRoles(session.user.id);
          if (mounted) {
            setIsAdmin(roles.admin);
            setIsDriver(roles.driver);
            setRolesLoaded(true);
          }
        } else {
          if (mounted) {
            setRolesLoaded(true);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      // Set loading state for role changes
      setRolesLoaded(false);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const roles = await checkUserRoles(session.user.id);
        if (mounted) {
          setIsAdmin(roles.admin);
          setIsDriver(roles.driver);
          setRolesLoaded(true);
        }
      } else {
        if (mounted) {
          setIsAdmin(false);
          setIsDriver(false);
          setRolesLoaded(true);
        }
      }
    });

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
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsDriver(false);
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
