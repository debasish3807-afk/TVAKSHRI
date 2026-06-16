import { Link } from "react-router-dom";
import { Leaf, Heart, Shield, Sparkles, ArrowRight } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";

const values = [
  { icon: Leaf, title: "Pure Botanicals", desc: "Every herb is wild-harvested or organically cultivated with full traceability from farm to face pack.", color: "bg-herbal-50 text-herbal-600" },
  { icon: Shield, title: "No Harmful Chemicals", desc: "Zero parabens, sulphates, synthetic fragrances, mineral oils or any ingredient that Ayurveda would reject.", color: "bg-cream-200 text-gold-700" },
  { icon: Heart, title: "Cruelty-Free", desc: "Never tested on animals. Our beauty ethics are as pure as our formulations.", color: "bg-rose-50 text-rose-500" },
  { icon: Sparkles, title: "Traditional Wisdom", desc: "Every formula is grounded in classical Ayurvedic texts — Charaka Samhita, Sushruta Samhita and Ashtanga Hridayam.", color: "bg-saffron-100 text-saffron-500" },
];

const milestones = [
  { year: "2020", event: "TVAKSHRI is born from a grandmother's kitchen — a single family recipe for neem face pack" },
  { year: "2021", event: "First batch of 500 Haldi Bright Face Packs sells out in 48 hours on Instagram" },
  { year: "2022", event: "Expanded to 6 products with dermatologist validation and GMP-certified manufacturing" },
  { year: "2023", event: "10,000+ satisfied customers across India · Featured in Vogue India's 'Best Natural Skincare'" },
  { year: "2024", event: "Launched Bridal Glow Ubtan — now our most loved bridal ritual" },
  { year: "2025", event: "TVAKSHRI goes national — 25,000+ happy glowing faces and counting" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-cream-100">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <img src={aboutHero} alt="About TVAKSHRI" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 to-foreground/30" />
        <div className="container-custom relative z-10 py-20">
          <div className="max-w-2xl text-white">
            <p className="font-sans text-xs uppercase tracking-widest text-gold-400 font-semibold mb-3">Our Story</p>
            <h1 className="font-display text-5xl md:text-6xl font-semibold leading-tight mb-6">
              Rooted in Ancient Wisdom.<br />
              <em className="not-italic text-gold-400">Crafted for Modern Skin.</em>
            </h1>
            <p className="font-sans text-base text-cream-300 leading-relaxed">
              TVAKSHRI (Sanskrit: त्वक्श्री — "the splendour of skin") was born from a profound belief: that the most powerful skincare ingredients were discovered by our ancestors thousands of years ago.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="prose-tvak space-y-6">
            <p className="font-sans text-xs uppercase tracking-widest text-gold-600 font-semibold text-center mb-2">The TVAKSHRI Story</p>
            <h2 className="section-title text-center mb-3">From Grandmother's Kitchen<br />to Your Vanity</h2>
            <div className="gold-divider" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
              <div className="space-y-4">
                <p className="font-sans text-base text-foreground leading-relaxed">
                  TVAKSHRI began in 2020 in a small Mumbai kitchen, where our founder Kavya watched her grandmother grind neem leaves and sandalwood into a healing paste — a ritual passed down through seven generations.
                </p>
                <p className="font-sans text-base text-foreground leading-relaxed">
                  Frustrated with chemical-laden products that promised results but damaged her sensitive skin, Kavya turned to Ayurveda — and discovered that those ancient recipes worked better than anything she'd found on a shelf.
                </p>
              </div>
              <div className="space-y-4">
                <p className="font-sans text-base text-foreground leading-relaxed">
                  What started as sharing packs with friends became TVAKSHRI — a brand committed to bringing the full power of Ayurvedic botanical science to modern skincare, without compromise on purity, ethics or luxury.
                </p>
                <p className="font-sans text-base text-foreground leading-relaxed">
                  Today, every TVAKSHRI formula is developed with certified Ayurvedic practitioners and validated by dermatologists, using only the finest wild-harvested and organically grown ingredients from across India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-cream-100">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="font-sans text-xs uppercase tracking-widest text-gold-600 font-semibold mb-2">What We Stand For</p>
            <h2 className="section-title mb-3">Our Core Values</h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-card transition-all text-center">
                <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-12">
            <p className="font-sans text-xs uppercase tracking-widest text-gold-600 font-semibold mb-2">Our Journey</p>
            <h2 className="section-title mb-3">Milestones</h2>
            <div className="gold-divider" />
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gold-gradient" />
            <div className="space-y-8">
              {milestones.map(({ year, event }) => (
                <div key={year} className="flex items-start gap-6 pl-4">
                  <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center flex-shrink-0 mt-1 shadow-gold text-[10px] font-bold text-white relative z-10 ml-4">
                    {year.slice(2)}
                  </div>
                  <div className="bg-cream-100 rounded-xl p-4 flex-1">
                    <span className="font-sans text-xs font-bold text-gold-600 block mb-1">{year}</span>
                    <p className="font-sans text-sm text-foreground leading-relaxed">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-foreground text-cream-100 text-center">
        <div className="container-custom max-w-xl">
          <h2 className="font-display text-3xl font-semibold mb-4">Experience the TVAKSHRI Ritual</h2>
          <p className="font-sans text-sm text-cream-400 mb-8">Join 25,000+ women who've discovered the glow that only Ayurvedic botanicals can give.</p>
          <Link to="/shop" className="btn-primary px-8 py-4 text-base">
            Shop Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
