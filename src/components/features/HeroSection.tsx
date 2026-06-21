import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Shield, Sparkles, Star } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const HeroSection = () => (
  <section className="relative min-h-[92vh] md:min-h-[88vh] flex items-center overflow-hidden" aria-label="Hero section">
    {/* Background image */}
    <div className="absolute inset-0">
      <img
        src={heroBg}
        alt="TVAKSHRI Luxury Herbal Skincare — Natural Ayurvedic ingredients"
        className="w-full h-full object-cover"
        fetchPriority="high"
        decoding="async"
      />
      {/* Layered overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
    </div>

    {/* Decorative floating elements */}
    <div className="absolute top-16 right-[10%] w-72 h-72 rounded-full bg-gold-500/8 blur-3xl animate-float pointer-events-none" aria-hidden="true" />
    <div className="absolute bottom-24 right-[20%] w-56 h-56 rounded-full bg-herbal-400/8 blur-2xl animate-float pointer-events-none" style={{ animationDelay: "1.5s" }} aria-hidden="true" />
    <div className="absolute top-1/3 right-[5%] w-40 h-40 rounded-full bg-gold-300/6 blur-xl pointer-events-none" aria-hidden="true" />

    <div className="container-custom relative z-10 py-20">
      <div className="max-w-2xl">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 border border-gold-400/30 backdrop-blur-sm rounded-full mb-6 animate-fade-up">
          <Leaf className="w-3.5 h-3.5 text-gold-400" aria-hidden="true" />
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

        {/* Social proof mini strip */}
        <div className="flex items-center gap-3 mb-8 animate-fade-up animate-delay-200">
          <div className="flex -space-x-2">
            {["P", "A", "K", "R", "S"].map((letter, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-gold-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                aria-hidden="true"
              >
                {letter}
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-gold-400 text-gold-400" aria-hidden="true" />
              ))}
            </div>
            <p className="font-sans text-xs text-cream-300">Loved by <strong className="text-cream-100">20,000+</strong> customers</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 mb-12 animate-fade-up animate-delay-300">
          <Link
            to="/shop"
            className="btn-primary text-base px-8 py-4 rounded-full shadow-gold-lg group"
          >
            Shop Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
          <Link
            to="/shop?filter=bestsellers"
            className="btn-ghost text-cream-200 border border-cream-200/30 hover:bg-white/10 hover:text-white px-8 py-4 rounded-full text-base backdrop-blur-sm"
          >
            Bestsellers ⭐
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-5 animate-fade-up animate-delay-400">
          {[
            { icon: Leaf, label: "Pure Botanicals", sub: "No harmful chemicals" },
            { icon: Shield, label: "Dermatologist Tested", sub: "Safe for all skin types" },
            { icon: Sparkles, label: "Visible Results", sub: "In 21 days or less" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-gold-500/25 border border-gold-400/20 flex items-center justify-center group-hover:bg-gold-500/40 transition-colors">
                <Icon className="w-4 h-4 text-gold-400" aria-hidden="true" />
              </div>
              <div>
                <p className="font-sans text-xs font-semibold text-cream-100 leading-tight">{label}</p>
                <p className="font-sans text-[10px] text-cream-400 leading-tight">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Scroll indicator */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce" aria-hidden="true">
      <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center pt-1">
        <div className="w-1 h-2 bg-white/60 rounded-full" />
      </div>
    </div>
  </section>
);
