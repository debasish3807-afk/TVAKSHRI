import { Link } from "react-router-dom";
import { Instagram, Mail, MessageCircle, Leaf, Heart } from "lucide-react";
import { useState } from "react";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-foreground text-cream-200 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-xl font-semibold text-cream-100">TVAKSHRI</span>
            </Link>
            <p className="font-sans text-sm text-cream-400 leading-relaxed mb-6">
              Ancient Ayurvedic wisdom, elevated to modern luxury. Handcrafted herbal skincare rooted in 5,000 years of botanical tradition.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com/tvakshri" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold-500 flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://wa.me/919876543210?text=Hi%20TVAKSHRI%2C%20I%20need%20help%20with%20my%20order" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#25D366] flex items-center justify-center transition-colors" aria-label="WhatsApp">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="mailto:support@tvakshri.com"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold-500 flex items-center justify-center transition-colors" aria-label="Email">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display text-base font-semibold text-cream-100 mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {[
                { to: "/shop", label: "All Products" },
                { to: "/shop?category=Face+Pack", label: "Face Packs" },
                { to: "/shop?category=Exfoliant", label: "Exfoliants" },
                { to: "/shop?category=Ubtan", label: "Ubtan Rituals" },
                { to: "/shop?filter=bestsellers", label: "Bestsellers" },
                { to: "/shop?filter=new", label: "New Arrivals" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="font-sans text-sm text-cream-400 hover:text-gold-400 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-display text-base font-semibold text-cream-100 mb-4">Information</h4>
            <ul className="space-y-2.5">
              {[
                { to: "/about", label: "About TVAKSHRI" },
                { to: "/track-order", label: "Track Order" },
                { to: "/contact", label: "Contact Us" },
                { to: "/faq", label: "FAQ" },
                { to: "/shipping-policy", label: "Shipping Policy" },
                { to: "/refund-policy", label: "Refund Policy" },
                { to: "/privacy-policy", label: "Privacy Policy" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="font-sans text-sm text-cream-400 hover:text-gold-400 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-base font-semibold text-cream-100 mb-2">Stay Radiant</h4>
            <p className="font-sans text-sm text-cream-400 mb-4">Subscribe for Ayurvedic skincare tips, exclusive offers and new launches.</p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-gold-400 font-sans text-sm">
                <Heart className="w-4 h-4 fill-current" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-cream-100 placeholder:text-cream-400/60 focus:outline-none focus:border-gold-400 transition-colors"
                  required
                />
                <button type="submit" className="w-full btn-primary text-sm py-2.5 rounded-xl">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-cream-400/60">
            © {new Date().getFullYear()} TVAKSHRI. All rights reserved. Crafted with <Heart className="w-3 h-3 inline fill-rose-500 text-rose-500" /> in India.
          </p>
          <div className="flex items-center gap-4">
            {["UPI", "Visa", "Mastercard", "RuPay"].map((p) => (
              <span key={p} className="font-sans text-xs text-cream-400/60 px-2 py-1 border border-white/10 rounded">{p}</span>
            ))}
          </div>
          <p className="font-sans text-xs text-cream-400/60">
            100% Natural · Cruelty-Free · Made in India
          </p>
        </div>
      </div>
    </footer>
  );
};
