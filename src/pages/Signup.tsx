import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Leaf, Lock, Mail, User } from "lucide-react";
import { authService, mapSupabaseUser } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { normalizeEmail, sanitizeText } from "@/lib/sanitize";
import { toast } from "sonner";

const schema = z
  .object({
    username: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const sanitizedEmail = normalizeEmail(data.email);
      const sanitizedUsername = sanitizeText(data.username).slice(0, 50);
      const user = await authService.signUp(sanitizedEmail, data.password, sanitizedUsername);
      login(mapSupabaseUser(user));
      toast.success("Welcome to TVAKSHRI!");
      navigate("/account", { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      toast.error(
        msg.toLowerCase().includes("already registered")
          ? "An account with this email already exists. Please sign in."
          : msg
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-semibold tracking-wider text-foreground">TVAKSHRI</span>
          </Link>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Create Account</h1>
          <div className="gold-divider" />
          <p className="font-sans text-sm text-muted-foreground mt-4">
            Join TVAKSHRI for exclusive offers and order tracking
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-product p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="font-sans text-sm font-medium text-foreground block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register("username")}
                  type="text"
                  autoComplete="name"
                  className="input-field pl-11"
                  placeholder="Priya Sharma"
                />
              </div>
              {errors.username && (
                <p className="font-sans text-xs text-rose-500 mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="font-sans text-sm font-medium text-foreground block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  className="input-field pl-11"
                  placeholder="priya@example.com"
                />
              </div>
              {errors.email && (
                <p className="font-sans text-xs text-rose-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="font-sans text-sm font-medium text-foreground block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  className="input-field pl-11 pr-11"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="font-sans text-xs text-rose-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="font-sans text-sm font-medium text-foreground block mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register("confirm")}
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  className="input-field pl-11 pr-11"
                  placeholder="Repeat password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm && (
                <p className="font-sans text-xs text-rose-500 mt-1">{errors.confirm.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="8" />
                  </svg>
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="font-sans text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-gold-600 font-semibold hover:text-gold-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center font-sans text-xs text-muted-foreground mt-6">
          By signing up you agree to our{" "}
          <Link to="/privacy-policy" className="underline hover:text-gold-600 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
