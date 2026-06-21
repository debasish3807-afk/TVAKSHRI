import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Star, Quote, Sparkles, TrendingUp, CheckCircle } from "lucide-react";
import { HeroSection } from "@/components/features/HeroSection";
import { BrandStrip } from "@/components/features/BrandStrip";
import { ProductCard } from "@/components/features/ProductCard";
import { TrustBar } from "@/components/features/TrustBar";
import { useProducts } from "@/hooks/useProducts";

const testimonials = [
  {
    name: "Priya S.",
    location: "Mumbai",
    text: "My skin has never looked better. The Haldi pack gave me a glow I've always dreamed of. Completely natural and it actually works!",
    rating: 5,
    product: "Haldi Bright Face Pack",
    result: "Visible results in 2 weeks",
    avatar: "P",
    avatarColor: "bg-saffron-200 text-saffron-600",
  },
  {
    name: "Anjali M.",
    location: "Delhi",
    text: "Used the Bridal Ubtan for my wedding — every guest complimented my glowing skin. I cried happy tears! TVAKSHRI is magical.",
    rating: 5,
    product: "Bridal Glow Ubtan",
    result: "21-day transformation",
    avatar: "A",
    avatarColor: "bg-bridal-100 text-bridal-600",
  },
  {
    name: "Kavitha R.",
    location: "Bangalore",
    text: "The Neem pack cleared my stubborn acne in 3 weeks. I've tried everything from big brands — nothing worked like this pure herbal pack.",
    rating: 5,
    product: "Neem Detox Face Pack",
    result: "Acne-free in 3 weeks",
    avatar: "K",
    avatarColor: "bg-herbal-50 text-herbal-600",
  },
];

const rituals = [
  { name: "Neem Detox", tagline: "For clear, balanced skin", color: "bg-herbal-50 border-herbal-200", textColor: "text-herbal-600", emoji: "🌿", slug: "neem" },
  { name: "Haldi Bright", tagline: "For golden radiance", color: "bg-saffron-100 border-saffron-200", textColor: "text-saffron-500", emoji: "✨", slug: "haldi" },
  { name: "Rose Glow", tagline: "For dewy hydration", color: "bg-rose-50 border-rose-200", textColor: "text-rose-500", emoji: "🌸", slug: "rose" },
  { name: "Bridal Ubtan", tagline: "For the royal ritual", color: "bg-bridal-100 border-bridal-200", textColor: "text-bridal-600", emoji: "👑", slug: "ubtan" },
];

const stats = [
  { value: "20K+", label: "Happy customers" },
  { value: "4.8★", label: "Average rating" },
  { value: "21", label: "Days to results" },
  { value: "100%", label: "Natural ingredients" },
];

export default function Home() {
  const { products, loading } = useProducts();
  const bestsellers = products.filter((p) => p.isBestseller);

  return (
    <div>
      <HeroSection />
      <TrustBar />
      <BrandStrip />

      {/* Stats Strip */}
      <section className="py-12 bg-white border-b border-border">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center group">
                <p className="font-display text-3xl md:text-4xl font-bold text-gold-600 mb-1 group-hover:scale-105 transition-transform">
                  {value}
                </p>
                <p className="font-sans text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-20 bg-cream-100" id="bestsellers">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-100 rounded-full mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-gold-600" />
              <p className="font-sans text-xs uppercase tracking-widest text-gold-600 font-semibold">Most Loved</p>
            </div>
            <h2 className="section-title mb-3">Bestselling Rituals</h2>
            <div className="gold-divider" />
            <p className="section-subtitle mt-4">
              Our most celebrated Ayurvedic face packs, trusted by thousands of glowing customers across India.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-soft animate-pulse">
                  <div className="aspect-square bg-cream-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-cream-200 rounded w-1/3" />
                    <div className="h-5 bg-cream-200 rounded w-2/3" />
                    <div className="h-6 bg-cream-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {(bestsellers.length > 0 ? bestsellers : products.slice(0, 3)).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/shop" className="btn-outline">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ritual Categories */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="font-sans text-xs uppercase tracking-widest text-gold-600 font-semibold mb-2">Find Your Ritual</p>
            <h2 className="section-title mb-3">Shop by Skin Concern</h2>
            <div className="gold-divider" />
            <p className="section-subtitle mt-4">Every skin type deserves a tailored Ayurvedic ritual.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {rituals.map((r) => (
              <Link
                key={r.name}
                to={`/shop?search=${r.slug}`}
                className={`${r.color} border rounded-2xl p-6 text-center hover:shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-300 group`}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{r.emoji}</div>
                <h3 className={`font-display text-base font-semibold ${r.textColor} mb-1`}>{r.name}</h3>
                <p className="font-sans text-xs text-muted-foreground">{r.tagline}</p>
                <div className={`mt-3 inline-flex items-center gap-1 font-sans text-[11px] font-semibold ${r.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Explore <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Full product grid */}
      <section className="py-20 bg-cream-100">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="font-sans text-xs uppercase tracking-widest text-gold-600 font-semibold mb-2">Complete Collection</p>
            <h2 className="section-title mb-3">All Herbal Rituals</h2>
            <div className="gold-divider" />
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-soft animate-pulse">
                  <div className="aspect-square bg-cream-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-cream-200 rounded w-1/3" />
                    <div className="h-5 bg-cream-200 rounded w-2/3" />
                    <div className="h-3 bg-cream-200 rounded w-full" />
                    <div className="h-6 bg-cream-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* About Banner */}
      <section className="py-20 bg-foreground text-cream-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #C9A84C 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-500/20 border border-gold-400/30 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <p className="font-sans text-xs uppercase tracking-widest text-gold-400 font-semibold">Our Philosophy</p>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-cream-100 mb-6">
              Skincare rooted in the wisdom of{" "}
              <em className="not-italic text-transparent bg-clip-text bg-gold-gradient">ancient India</em>
            </h2>
            <div className="w-16 h-0.5 bg-gold-gradient mx-auto mb-6" />
            <p className="font-sans text-base text-cream-300 leading-relaxed mb-8">
              TVAKSHRI was born from a deep reverence for Ayurveda — the world's oldest system of holistic healing. Every formula is crafted from wild-harvested and organically cultivated herbs, following classical Ayurvedic texts, with no synthetic fragrances, parabens or harmful chemicals.
            </p>

            {/* Philosophy pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
              {[
                { title: "Wild Harvested", desc: "Herbs sourced from pristine forests and organic farms across India." },
                { title: "Ancient Formulas", desc: "Recipes traced from 5,000-year-old Ayurvedic texts and traditions." },
                { title: "Zero Toxins", desc: "No parabens, sulphates, silicones, mineral oil or synthetic fragrance." },
              ].map(({ title, desc }) => (
                <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <CheckCircle className="w-5 h-5 text-gold-400 mb-3" />
                  <h4 className="font-display text-sm font-semibold text-cream-100 mb-1">{title}</h4>
                  <p className="font-sans text-xs text-cream-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <Link to="/about" className="btn-outline border-gold-400 text-gold-400 hover:bg-gold-500 hover:border-gold-500 hover:text-white">
              Discover Our Story <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-cream-100">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="font-sans text-xs uppercase tracking-widest text-gold-600 font-semibold mb-2">Real Results</p>
            <h2 className="section-title mb-3">Loved by Thousands</h2>
            <div className="gold-divider" />
            <p className="section-subtitle mt-4">Real stories from customers who transformed their skin with Ayurvedic wisdom.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-soft relative group hover:shadow-card hover:-translate-y-1 transition-all duration-300">
                {/* Quote mark */}
                <Quote className="w-8 h-8 text-gold-200 mb-4" />

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
                  ))}
                </div>

                <p className="font-sans text-sm text-foreground leading-relaxed mb-4 italic">"{t.text}"</p>

                {/* Result badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-herbal-50 border border-herbal-200 rounded-full mb-4">
                  <CheckCircle className="w-3 h-3 text-herbal-500" />
                  <span className="font-sans text-[11px] text-herbal-600 font-semibold">{t.result}</span>
                </div>

                <div className="border-t border-border pt-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.avatarColor} flex items-center justify-center font-display font-bold text-sm flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm text-foreground">{t.name}</p>
                    <p className="font-sans text-xs text-muted-foreground">{t.location} · Verified buyer</p>
                    <p className="font-sans text-xs text-gold-600 mt-0.5">{t.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gold-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="container-custom relative z-10">
          <div className="max-w-xl mx-auto text-center">
            <Sparkles className="w-8 h-8 text-white/80 mx-auto mb-4" />
            <h2 className="font-display text-3xl font-semibold text-white mb-3">Get 10% Off Your First Order</h2>
            <p className="font-sans text-sm text-white/80 mb-6">
              Subscribe to receive Ayurvedic skincare tips, exclusive launches and special offers.
              Use code <strong className="bg-white/20 px-2 py-0.5 rounded font-mono">TVAK10</strong> at checkout!
            </p>
            <form
              className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-full text-sm bg-white/20 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/30 transition-colors"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-gold-600 font-semibold text-sm rounded-full hover:bg-cream-100 transition-colors whitespace-nowrap shadow-md hover:shadow-lg active:scale-95"
              >
                Subscribe
              </button>
            </form>
            <p className="font-sans text-xs text-white/60 mt-3">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
