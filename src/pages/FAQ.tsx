import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    category: "Products",
    items: [
      { q: "Are TVAKSHRI products 100% natural?", a: "Yes, absolutely. Every ingredient in our formulations is 100% natural — derived from plants, herbs, minerals or botanicals. We use zero synthetic fragrances, parabens, sulphates, mineral oil or silicones. Our formulas are rooted in classical Ayurvedic texts." },
      { q: "Are TVAKSHRI products suitable for sensitive skin?", a: "Our products are dermatologist-tested and formulated for all skin types including sensitive skin. However, we always recommend doing a patch test on your inner wrist 24 hours before first use, especially if you have known allergies." },
      { q: "Can I use the face packs every day?", a: "We recommend using most face packs 2–3 times per week for optimal results. The Rice Polish Powder should be used no more than twice a week as it is an exfoliant. The Bridal Ubtan may be used daily as part of a pre-bridal ritual." },
      { q: "Do the products have an expiry date?", a: "Yes, all products have a 24-month shelf life from the date of manufacture. The manufacturing date and best-before date are printed on the packaging. Always store in a cool, dry place away from direct sunlight." },
      { q: "Are TVAKSHRI products cruelty-free?", a: "Yes, TVAKSHRI is 100% cruelty-free. We never test any of our products or ingredients on animals, and we only source from suppliers who share this commitment." },
    ]
  },
  {
    category: "Shipping & Orders",
    items: [
      { q: "How long does delivery take?", a: "Standard delivery takes 3–7 business days across India. Express delivery (1–3 days) is available in major metro cities. You will receive a tracking number via SMS and email once your order is shipped." },
      { q: "Do you offer free shipping?", a: "Yes! We offer FREE shipping on all prepaid orders above ₹999. For orders below ₹999, a flat shipping charge of ₹80 applies." },
      { q: "Which payment methods do you accept?", a: "We accept all major prepaid payment methods including UPI (Google Pay, PhonePe, BHIM, Paytm), Credit Cards, Debit Cards, and Net Banking. We do NOT offer Cash on Delivery (COD)." },
      { q: "Can I modify or cancel my order?", a: "You can cancel or modify your order within 2 hours of placing it by contacting us on WhatsApp (+91 98765 43210) or email (support@tvakshri.com). After 2 hours, orders enter processing and cannot be modified." },
    ]
  },
  {
    category: "Returns & Refunds",
    items: [
      { q: "What is your return policy?", a: "Due to the nature of beauty and skincare products, we do NOT accept returns or offer refunds on opened or used products. Refunds are only applicable in cases of wrong product delivered or damaged/defective packaging." },
      { q: "What if I receive a wrong or damaged product?", a: "We sincerely apologise if this happens. Please contact us within 48 hours of delivery with your order ID and clear photos of the issue. We will arrange a replacement or full refund within 5–7 business days." },
      { q: "I had an allergic reaction. What should I do?", a: "Stop using the product immediately and wash the affected area with cool water. Consult a dermatologist if the reaction is severe. Please reach out to us with details — we take all skin reactions seriously and will assist you." },
    ]
  },
];

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-none">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 py-4 text-left">
        <span className="font-sans text-sm font-semibold text-foreground leading-relaxed">{q}</span>
        <ChevronDown className={cn("w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && <p className="font-sans text-sm text-muted-foreground leading-relaxed pb-4">{a}</p>}
    </div>
  );
};

export default function FAQ() {
  return (
    <div className="min-h-screen bg-cream-100">
      <section className="page-hero text-center">
        <div className="container-custom">
          <h1 className="section-title mb-3">Frequently Asked Questions</h1>
          <div className="gold-divider" />
          <p className="section-subtitle mt-4">Everything you need to know about TVAKSHRI products, orders and policies.</p>
        </div>
      </section>

      <div className="container-custom py-12 max-w-3xl">
        <div className="space-y-8">
          {faqs.map(({ category, items }) => (
            <div key={category} className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="p-4 bg-cream-200 border-b border-border">
                <h2 className="font-display text-lg font-semibold text-foreground">{category}</h2>
              </div>
              <div className="px-6">
                {items.map((item) => <FAQItem key={item.q} q={item.q} a={item.a} />)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-foreground text-cream-100 rounded-2xl p-8 text-center">
          <h3 className="font-display text-2xl font-semibold mb-2">Still have questions?</h3>
          <p className="font-sans text-sm text-cream-400 mb-6">Our skincare advisors are happy to help via WhatsApp.</p>
          <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full font-sans font-semibold text-sm hover:bg-[#128C7E] transition-colors">
            <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
