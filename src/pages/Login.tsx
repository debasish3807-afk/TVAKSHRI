import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Leaf, Lock, Mail, AlertTriangle } from "lucide-react";
import { authService, mapSupabaseUser } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { useLoginProtection } from "@/hooks/useLoginProtection";
import { normalizeEmail } from "@/lib/sanitize";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { checkBlocked, recordFailure, recordSuccess } = useLoginProtection();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lockoutInfo, setLockoutInfo] = useState<{ locked: boolean; secondsLeft?: number } | null>(null);

  const from = (location.state as { from?: string })?.from || "/account";

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const emailValue = watch("email", "");

  const onSubmit = async (data: FormData) => {
    const email = normalizeEmail(data.email);

    // Check brute-force lockout before attempting
    const blockStatus = checkBlocked(email);
    if (blockStatus.blocked) {
      const mins = Math.ceil((blockStatus.secondsLeft ?? 0) / 60);
      toast.error(`Too many failed attempts. Try again in ${mins} minute${mins !== 1 ? "s" : ""}.`);
      setLockoutInfo(blockStatus);
      return;
    }

    setLoading(true);
    setLockoutInfo(null);

    try {
      const user = await authService.signInWithPassword(email, data.password);
      recordSuccess(email);
      login(mapSupabaseUser(user));
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      const result = recordFailure(email);

      if (result.locked) {
        const mins = Math.ceil((result.secondsLeft ?? 0) / 60);
        setLockoutInfo({ locked: true, secondsLeft: result.secondsLeft });
        toast.error(`Account locked for ${mins} minute${mins !== 1 ? "s" : ""} due to too many failed attempts.`);
      } else {
        const attemptsLeft = result.attemptsLeft ?? 0;
        if (msg.includes("Invalid") || msg.includes("credentials")) {
          toast.error(
            attemptsLeft <= 2
              ? `Incorrect email or password. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining.`
              : "Incorrect email or password"
          );
        } else {
          toast.error(msg);
        }
      }
      setLoading(false);
    }
  };

  // Check lockout status for current email input
  const currentBlockStatus = emailValue ? checkBlocked(normalizeEmail(emailValue)) : { blocked: false };

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
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Welcome Back</h1>
          <div className="gold-divider" />
          <p className="font-sans text-sm text-muted-foreground mt-4">
            Sign in to access your account, orders & wishlist
          </p>
        </div>

        {/* Lockout warning */}
        {(lockoutInfo?.locked || currentBlockStatus.blocked) && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-sans text-sm font-semibold text-rose-700">Account temporarily locked</p>
              <p className="font-sans text-xs text-rose-600 mt-0.5">
                Too many failed login attempts. Please wait{" "}
                {Math.ceil(((lockoutInfo?.secondsLeft ?? currentBlockStatus.secondsLeft) ?? 0) / 60)} minute(s) before trying again.
              </p>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-product p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="font-sans text-sm font-medium text-foreground block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                <input
                  {...register("email")}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className="input-field pl-11"
                  placeholder="priya@example.com"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </div>
              {errors.email && (
                <p role="alert" className="font-sans text-xs text-rose-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="font-sans text-sm font-medium text-foreground">Password</label>
                <Link
                  to="/forgot-password"
                  className="font-sans text-xs text-gold-600 hover:text-gold-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                <input
                  {...register("password")}
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  className="input-field pl-11 pr-11"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="font-sans text-xs text-rose-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || currentBlockStatus.blocked}
              className="btn-primary w-full py-4 text-base mt-2 disabled:opacity-70"
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="8" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="font-sans text-sm text-muted-foreground">
              New to TVAKSHRI?{" "}
              <Link to="/signup" className="text-gold-600 font-semibold hover:text-gold-700 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center font-sans text-xs text-muted-foreground mt-6">
          By signing in you agree to our{" "}
          <Link to="/privacy-policy" className="underline hover:text-gold-600 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
