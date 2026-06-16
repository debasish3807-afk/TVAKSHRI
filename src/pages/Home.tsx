import { Link } from "react-router-dom";
import { ArrowRight, Star, Quote } from "lucide-react";
import { HeroSection } from "@/components/features/HeroSection";
import { BrandStrip } from "@/components/features/BrandStrip";
import { ProductCard } from "@/components/features/ProductCard";
import { useProducts } from "@/hooks/useProducts";

const testimonials = [
  { name: "Priya S.", location: "Mumbai", text: "My skin has never looked better. The Haldi pack gave me a glow I've always dreamed of. Completely natural and it actually works!", rating: 5, product: "Haldi Bright Face Pack" },
  { name: "Anjali M.", location: "Delhi", text: "Used the Bridal Ubtan for my wedding — every guest complimented my glowing skin. I cried happy tears! TVAKSHRI is magical.", rating: 5, product: "Bridal Glow Ubtan" },
  { name: "Kavitha R.", location: "Bangalore", text: "The Neem pack cleared my stubborn acne in 3 weeks. I've tried everything from big brands — nothing worked like this pure herbal pack.", rating: 5, product: "Neem Detox Face Pack" },
];

const rituals = [
  { name: "Neem Detox", tagline: "For clear, balanced skin", color: "bg-herbal-50 border-herbal-200", textColor: "text-herbal-600", emoji: "🌿" },
  { name: "Haldi Bright", tagline: "For golden radiance", color: "bg-saffron-100 border-saffron-200", textColor: "text-saffron-500", emoji: "✨" },
  { name: "Rose Glow", tagline: "For dewy hydration", color: "bg-rose-50 border-rose-200", textColor: "text-rose-500", emoji: "🌸" },
  { name: "Bridal Ubtan", tagline: "For the royal ritual", color: "bg-bridal-100 border-bridal-200", textColor: "text-bridal-600", emoji: "👑" },
];

export default function Home() {
  // Use live Supabase products (with fallback to static data)
  const { products, loading } = useProducts();
  const bestsellers = products.filter((p) => p.isBestseller);

  return (
    <div>
      <HeroSection />
      <BrandStrip />

      {/* Bestsellers */}
      <section className="py-20 bg-cream-100">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="font-sans text-xs uppercase tracking-widest text-gold-600 font-semibold mb-2">Most Loved</p>
            <h2 className="section-title mb-3">Bestselling Rituals</h2>
            <div className="gold-divider" />
            <p className="section-subtitle mt-4">Our most celebrated Ayurvedic face packs, trusted by thousands of glowing customers across India.</p>
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
            <Link to="/shop" className="btn-outline">View All Products <ArrowRight className="w-4 h-4" /></Link>
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
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {rituals.map((r) => (
              <Link key={r.name} to={`/shop?search=${r.name.split(" ")[0]}`}
                className={`${r.color} border rounded-2xl p-6 text-center hover:shadow-card transition-all duration-300 hover:-translate-y-1 group`}>
                <div className="text-4xl mb-3">{r.emoji}</div>
                <h3 className={`font-display text-base font-semibold ${r.textColor} mb-1`}>{r.name}</h3>
                <p className="font-sans text-xs text-muted-foreground">{r.tagline}</p>
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
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-sans text-xs uppercase tracking-widest text-gold-400 font-semibold mb-4">Our Philosophy</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-cream-100 mb-6">
              Skincare rooted in the wisdom of <em className="not-italic text-gold-400">ancient India</em>
            </h2>
            <div className="w-16 h-0.5 bg-gold-gradient mx-auto mb-6" />
            <p className="font-sans text-base text-cream-300 leading-relaxed mb-8">
              TVAKSHRI was born from a deep reverence for Ayurveda — the world's oldest system of holistic healing. Every formula is crafted from wild-harvested and organically cultivated herbs, following classical Ayurvedic texts, with no synthetic fragrances, parabens or harmful chemicals.
            </p>
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-soft relative">
                <Quote className="w-8 h-8 text-gold-300 mb-4" />
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />)}
                </div>
                <p className="font-sans text-sm text-foreground leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="border-t border-border pt-4 mt-auto">
                  <p className="font-display font-semibold text-sm text-foreground">{t.name}</p>
                  <p className="font-sans text-xs text-muted-foreground">{t.location} · Verified buyer</p>
                  <p className="font-sans text-xs text-gold-600 mt-1">{t.product}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gold-gradient">
        <div className="container-custom">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-display text-3xl font-semibold text-white mb-3">Get 10% Off Your First Order</h2>
            <p className="font-sans text-sm text-white/80 mb-6">Subscribe to receive Ayurvedic skincare tips, exclusive launches and special offers. Use code <strong>TVAK10</strong> at checkout!</p>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); }}>
              <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-full text-sm bg-white/20 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/30" required />
              <button type="submit" className="px-6 py-3 bg-white text-gold-600 font-semibold text-sm rounded-full hover:bg-cream-100 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
