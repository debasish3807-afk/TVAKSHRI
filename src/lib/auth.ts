import { supabase } from "@/lib/supabase";
import type { AuthUser } from "@/hooks/useAuth";
import type { User } from "@supabase/supabase-js";

export function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    username:
      user.user_metadata?.username ||
      user.user_metadata?.full_name ||
      user.email!.split("@")[0],
    avatar: user.user_metadata?.avatar_url,
  };
}

export const authService = {
  /** Register with email + password (no OTP, no email verification) */
  async signUp(email: string, password: string, username: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
    if (error) throw error;
    // If email confirmation is disabled in Supabase dashboard, session is returned immediately
    const user = data.session?.user ?? data.user;
    if (!user) throw new Error("Signup succeeded but no user was returned. Please check Supabase email confirmation settings.");
    return user;
  },

  /** Login with email + password */
  async signInWithPassword(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  },

  /** Send password reset email */
  async sendPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  /** Update password (called after reset link redirect) */
  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  /** Sign out */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
