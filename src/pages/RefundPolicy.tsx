import { AlertCircle, CheckCircle2, XCircle, MessageCircle } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-cream-100">
      <section className="page-hero text-center">
        <div className="container-custom">
          <h1 className="section-title mb-3">Refund & Return Policy</h1>
          <div className="gold-divider" />
          <p className="section-subtitle mt-4">Please read carefully before placing your order</p>
        </div>
      </section>
      <div className="container-custom py-12 max-w-3xl">
        {/* Policy highlight */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display text-lg font-semibold text-amber-800 mb-1">Important Notice</h3>
            <p className="font-sans text-sm text-amber-700">TVAKSHRI is a premium beauty brand. Due to hygiene and safety standards, we do not accept returns or issue refunds on opened or used skincare products. Refunds are only issued in specific cases as listed below.</p>
          </div>
        </div>

        {/* What's eligible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-herbal-50 border border-herbal-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-herbal-600" />
              <h3 className="font-display text-base font-semibold text-herbal-700">Eligible for Refund</h3>
            </div>
            <ul className="space-y-2">
              {["Wrong product delivered", "Damaged or broken packaging", "Significantly different from description", "Delivery never received (after investigation)"].map((item) => (
                <li key={item} className="flex items-start gap-2 font-sans text-sm text-herbal-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-herbal-500 mt-2 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-rose-600" />
              <h3 className="font-display text-base font-semibold text-rose-700">Not Eligible for Refund</h3>
            </div>
            <ul className="space-y-2">
              {["Opened or used products", "Change of mind", "Allergic reactions (always patch test)", "Products returned without prior approval", "Damage due to misuse or improper storage"].map((item) => (
                <li key={item} className="flex items-start gap-2 font-sans text-sm text-rose-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-8 space-y-6 font-sans text-sm text-foreground leading-relaxed">
          {[
            { title: "How to Raise a Refund Request", body: "If you believe you qualify for a refund, please contact us within 48 hours of delivery. Send your Order ID and clear photographs of the issue to support@tvakshri.com or WhatsApp us at +91 98765 43210. Our team will review and respond within 24–48 hours." },
            { title: "Refund Processing Time", body: "Once your refund is approved, the amount will be credited back to your original payment method within 5–7 business days. For UPI, refunds typically arrive within 24–48 hours. Bank transfers may take up to 7 business days." },
            { title: "Product Replacement", body: "In most eligible cases, we prefer to replace the product rather than issue a refund. If a replacement is not available (out of stock), a full refund will be processed." },
            { title: "Patch Test Reminder", body: "We strongly recommend conducting a patch test before using any new skincare product, even if formulated for sensitive skin. Apply a small amount to your inner wrist and wait 24 hours before full application." },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="font-display text-lg font-semibold mb-2">{title}</h2>
              <p className="text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-foreground text-cream-100 rounded-2xl p-6 text-center">
          <h3 className="font-display text-xl font-semibold mb-2">Need Help with Your Order?</h3>
          <p className="font-sans text-sm text-cream-400 mb-4">Contact us and we'll resolve it as quickly as possible.</p>
          <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full font-sans font-semibold text-sm hover:bg-[#128C7E] transition-colors">
            <MessageCircle className="w-4 h-4" /> Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
