import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Leaf, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authService } from "@/lib/auth";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authService.sendPasswordReset(data.email);
      setSentEmail(data.email);
      setSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
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
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Reset Password</h1>
          <div className="gold-divider" />
        </div>

        <div className="bg-white rounded-3xl shadow-product p-8">
          {sent ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-herbal-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-herbal-500" />
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                Check Your Email
              </h2>
              <p className="font-sans text-sm text-muted-foreground mb-1">
                We've sent a password reset link to
              </p>
              <p className="font-sans text-sm font-semibold text-gold-600 mb-6">{sentEmail}</p>
              <p className="font-sans text-xs text-muted-foreground mb-6 bg-cream-100 rounded-xl p-3">
                Click the link in the email to reset your password. The link expires in 1 hour.
                Check your spam/junk folder if you don't see it.
              </p>
              <button
                onClick={() => { setSent(false); setSentEmail(""); }}
                className="btn-outline w-full py-3 text-sm"
              >
                Try a different email
              </button>
            </div>
          ) : (
            /* Form state */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <p className="font-sans text-sm text-muted-foreground text-center">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>
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
                    Sending link...
                  </span>
                ) : "Send Reset Link"}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-gold-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
