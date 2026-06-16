import { Leaf, Award, Truck, RotateCcw } from "lucide-react";

const features = [
  { icon: Leaf, label: "100% Natural", sub: "Pure Ayurvedic botanicals" },
  { icon: Award, label: "Premium Quality", sub: "Dermatologist tested" },
  { icon: Truck, label: "Free Shipping", sub: "On orders above ₹999" },
  { icon: RotateCcw, label: "Easy Returns", sub: "Damaged/wrong item support" },
];

export const BrandStrip = () => (
  <section className="bg-foreground text-cream-100">
    <div className="container-custom py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <p className="font-sans text-sm font-semibold text-cream-100">{label}</p>
              <p className="font-sans text-xs text-cream-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
