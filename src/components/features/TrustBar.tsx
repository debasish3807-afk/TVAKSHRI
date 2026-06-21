import { Truck, Shield, RefreshCcw, Leaf, Award, Phone } from "lucide-react";

const badges = [
  { icon: Truck, label: "Free Shipping", sub: "On orders above ₹999" },
  { icon: Shield, label: "Secure Payment", sub: "SSL encrypted checkout" },
  { icon: RefreshCcw, label: "Easy Returns", sub: "7-day return policy" },
  { icon: Leaf, label: "100% Natural", sub: "No harmful chemicals" },
  { icon: Award, label: "Certified Quality", sub: "GMP & ISO certified" },
  { icon: Phone, label: "24/7 Support", sub: "WhatsApp & email" },
];

export function TrustBar() {
  return (
    <section className="bg-white border-y border-border py-6 overflow-hidden">
      <div className="container-custom">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500 transition-colors duration-200">
                <Icon className="w-5 h-5 text-gold-600 group-hover:text-white transition-colors duration-200" />
              </div>
              <div className="min-w-0">
                <p className="font-sans text-xs font-semibold text-foreground leading-tight">{label}</p>
                <p className="font-sans text-[10px] text-muted-foreground leading-tight truncate">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
