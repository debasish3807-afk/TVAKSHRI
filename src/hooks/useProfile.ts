import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

/** Compress an image File using Canvas API before upload */
async function compressImage(file: File, maxWidth = 400, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Image compression failed"));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export function useProfile() {
  const { user, login } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar);
  const [uploading, setUploading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Use a ref to always access current user/login without re-creating callbacks
  const userRef = useRef(user);
  const loginRef = useRef(login);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { loginRef.current = login; }, [login]);

  // Fetch saved avatar_url from user_profiles table
  const fetchProfile = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser?.id) return;
    setLoadingProfile(true);
    const { data } = await supabase
      .from("user_profiles")
      .select("avatar_url, display_name")
      .eq("user_id", currentUser.id)
      .maybeSingle();
    if (data?.avatar_url) {
      setAvatarUrl(data.avatar_url);
      // Sync back to auth context using latest references
      loginRef.current({
        ...currentUser,
        avatar: data.avatar_url,
        username: data.display_name || currentUser.username,
      });
    }
    setLoadingProfile(false);
  }, []); // stable — uses refs internally

  // Only fetch when user ID changes (login/logout)
  const prevUserId = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (user?.id && user.id !== prevUserId.current) {
      prevUserId.current = user.id;
      fetchProfile();
    }
    if (!user?.id) {
      prevUserId.current = undefined;
      setAvatarUrl(undefined);
    }
  }, [user?.id, fetchProfile]);

  const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
    const currentUser = userRef.current;
    if (!currentUser?.id) return null;
    setUploading(true);
    try {
      // Compress before upload
      const compressed = await compressImage(file, 400, 0.82);
      const path = `${currentUser.id}/avatar.jpg`;

      // Remove old file first (ignore error if it doesn't exist yet)
      await supabase.storage.from("avatars").remove([path]);

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, compressed, {
          contentType: "image/jpeg",
          upsert: false,
        });
      if (uploadError) throw uploadError;

      // Get public URL with cache-bust
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Upsert into user_profiles table
      const { error: dbError } = await supabase.from("user_profiles").upsert(
        { user_id: currentUser.id, avatar_url: publicUrl, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
      if (dbError) throw dbError;

      // Update Supabase auth user metadata
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

      setAvatarUrl(publicUrl);
      loginRef.current({ ...currentUser, avatar: publicUrl });
      return publicUrl;
    } finally {
      setUploading(false);
    }
  }, []); // stable — uses refs internally

  return { avatarUrl, uploading, loadingProfile, uploadAvatar, fetchProfile };
}
