import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Shield, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const HeroSection = () => (
  <section className="relative min-h-[90vh] flex items-center overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0">
      <img src={heroBg} alt="TVAKSHRI Luxury Herbal Skincare" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
    </div>

    {/* Decorative elements */}
    <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-gold-500/10 blur-3xl" />
    <div className="absolute bottom-20 right-32 w-48 h-48 rounded-full bg-herbal-400/10 blur-2xl" />

    <div className="container-custom relative z-10 py-20">
      <div className="max-w-2xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 border border-gold-400/30 rounded-full mb-6 animate-fade-up">
          <Leaf className="w-3.5 h-3.5 text-gold-400" />
          <span className="font-sans text-xs font-semibold text-gold-300 uppercase tracking-widest">100% Natural · Ayurvedic · Cruelty-Free</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-none mb-6 animate-fade-up animate-delay-100">
          Ancient Herbs,
          <br />
          <em className="not-italic text-transparent bg-clip-text bg-gold-gradient">Timeless Glow.</em>
        </h1>

        <p className="font-sans text-base md:text-lg text-cream-300 max-w-lg leading-relaxed mb-8 animate-fade-up animate-delay-200">
          Discover TVAKSHRI — luxury Ayurvedic face packs and rituals handcrafted from sacred herbs, wild-harvested botanicals and precious spices for luminous, balanced skin.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 mb-12 animate-fade-up animate-delay-300">
          <Link to="/shop" className="btn-primary text-base px-8 py-4 rounded-full shadow-gold-lg">
            Shop Now <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/about" className="btn-ghost text-cream-200 border border-cream-200/30 hover:bg-white/10 hover:text-white px-8 py-4 rounded-full text-base">
            Our Story
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-6 animate-fade-up animate-delay-400">
          {[
            { icon: Leaf, label: "Pure Botanicals", sub: "No harmful chemicals" },
            { icon: Shield, label: "Dermatologist Tested", sub: "Safe for all skin types" },
            { icon: Sparkles, label: "Visible Results", sub: "In 21 days or less" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <p className="font-sans text-xs font-semibold text-cream-100">{label}</p>
                <p className="font-sans text-[10px] text-cream-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
