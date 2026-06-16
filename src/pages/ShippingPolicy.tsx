import { Truck, Clock, MapPin, Package } from "lucide-react";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-cream-100">
      <section className="page-hero text-center">
        <div className="container-custom">
          <h1 className="section-title mb-3">Shipping Policy</h1>
          <div className="gold-divider" />
          <p className="section-subtitle mt-4">Everything you need to know about delivery</p>
        </div>
      </section>
      <div className="container-custom py-12 max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            { icon: Truck, title: "Free Shipping", desc: "On all prepaid orders above ₹999", color: "bg-herbal-50 text-herbal-600" },
            { icon: Clock, title: "Delivery Time", desc: "3–7 business days across India", color: "bg-saffron-100 text-saffron-500" },
            { icon: Package, title: "Express Delivery", desc: "1–3 days in select metro cities", color: "bg-gold-100 text-gold-700" },
            { icon: MapPin, title: "Pan India", desc: "Delivering to all 28 states and 8 UTs", color: "bg-rose-50 text-rose-500" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className={`rounded-xl p-4 flex items-center gap-3 ${color.split(" ")[0]} border border-current/10`}>
              <Icon className={`w-6 h-6 ${color.split(" ")[1]} flex-shrink-0`} />
              <div>
                <p className="font-sans text-sm font-semibold text-foreground">{title}</p>
                <p className="font-sans text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-8 space-y-6 font-sans text-sm text-foreground leading-relaxed">
          {[
            { title: "Shipping Charges", body: "We offer FREE shipping on all prepaid orders above ₹999. For orders below ₹999, a flat shipping fee of ₹80 is applicable. We currently offer standard shipping only — no Cash on Delivery (COD)." },
            { title: "Processing Time", body: "Orders are processed within 1–2 business days of payment confirmation (Monday to Saturday, excluding public holidays). You will receive an order confirmation email and SMS upon successful payment." },
            { title: "Delivery Timeline", body: "Standard delivery: 3–7 business days. Express delivery (available in Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune): 1–3 business days at an additional charge of ₹99. Remote areas (North-East, hilly regions) may take up to 10 business days." },
            { title: "Order Tracking", body: "Once your order is dispatched, you will receive a tracking number via SMS and email. You can track your order on our shipping partner's website or WhatsApp us for a status update." },
            { title: "Packaging", body: "We use eco-friendly, tamper-evident packaging with bubble wrap protection to ensure your products arrive safely. All products are sealed and packed in our signature cream and gold boxes." },
            { title: "Undeliverable Packages", body: "If a delivery attempt fails due to incorrect address or unavailability, the package will be returned to us. We will contact you to reship at your expense. Please ensure your address and phone number are accurate at checkout." },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">{title}</h2>
              <p className="text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
