import { useState, useEffect, useCallback } from "react";
import { X, Mail, Leaf, Gift, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "tvak_newsletter_dismissed";
const EXIT_DELAY_MS = 8000; // show after 8s or exit intent

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback((permanent = false) => {
    setVisible(false);
    setTimeout(() => setOpen(false), 300);
    if (permanent) {
      try { localStorage.setItem(STORAGE_KEY, "true"); } catch { /* ignore */ }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubmitted(true);
    try { localStorage.setItem(STORAGE_KEY, "true"); } catch { /* ignore */ }
    setTimeout(() => dismiss(true), 2500);
  };

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch { /* ignore */ }

    // Exit intent on desktop
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        setOpen(true);
        setTimeout(() => setVisible(true), 20);
        document.removeEventListener("mouseleave", onMouseLeave);
      }
    };

    // Fallback: show after delay on mobile
    const timer = setTimeout(() => {
      setOpen(true);
      setTimeout(() => setVisible(true), 20);
      document.removeEventListener("mouseleave", onMouseLeave);
    }, EXIT_DELAY_MS);

    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 transition-all duration-300",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={() => dismiss(false)}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full max-w-md bg-white rounded-3xl shadow-product overflow-hidden transition-all duration-300",
          visible ? "translate-y-0 scale-100" : "translate-y-8 scale-95"
        )}
      >
        {/* Decorative top strip */}
        <div className="h-2 w-full bg-gold-gradient" />

        <button
          onClick={() => dismiss(true)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream-200 hover:bg-rose-100 flex items-center justify-center transition-colors z-10"
          aria-label="Close popup"
        >
          <X className="w-4 h-4 text-muted-foreground hover:text-rose-500" />
        </button>

        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-herbal-100 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-herbal-500" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-2">You're In! 🎉</h3>
              <p className="font-sans text-sm text-muted-foreground mb-3">
                Your <strong className="text-gold-600">10% off coupon</strong> is on its way.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-50 border border-gold-200 rounded-full">
                <span className="font-mono text-base font-bold text-gold-700 tracking-widest">TVAK10</span>
              </div>
              <p className="font-sans text-xs text-muted-foreground mt-3">Use at checkout. Valid for 48 hours.</p>
            </div>
          ) : (
            <>
              {/* Icon + headline */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-sans text-xs uppercase tracking-widest text-gold-600 font-semibold">Exclusive Offer</p>
                  <h3 className="font-display text-xl font-semibold text-foreground">Get 10% Off Your Order</h3>
                </div>
              </div>

              <p className="font-sans text-sm text-muted-foreground mb-5 leading-relaxed">
                Join 20,000+ skincare enthusiasts. Get Ayurvedic tips, early access to new launches, and your welcome discount.
              </p>

              {/* Benefits */}
              <div className="flex flex-wrap gap-2 mb-5">
                {["Early access", "Skin tips", "Exclusive deals", "Birthday gift"].map((b) => (
                  <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 bg-cream-200 rounded-full font-sans text-xs text-foreground">
                    <Sparkles className="w-2.5 h-2.5 text-gold-500" /> {b}
                  </span>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="input-field pl-10 text-sm"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-3.5 text-sm">
                  Claim My 10% Off →
                </button>
              </form>

              <p className="font-sans text-[11px] text-muted-foreground text-center mt-3">
                No spam, ever. Unsubscribe anytime. By subscribing you agree to our privacy policy.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
