
import { useState } from "react";
import { Mail, MessageCircle, Instagram, MapPin, Clock, CheckCircle2, ArrowRight } from "lucide-react";

const WA_NUMBER = "919876543210";

function buildWhatsAppUrl(topic: string = "") {
  const base = `Hi TVAKSHRI, I need help with${topic ? ` my ${topic}` : "..."}\n\nPlease assist me.`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(base)}`;
}

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => setSent(true), 800);
  };

  const contacts = [
    { icon: Mail, label: "Email", value: "support@tvakshri.com", href: "mailto:support@tvakshri.com", sub: "We reply within 24 hours" },
    { icon: MessageCircle, label: "WhatsApp", value: "+91 98765 43210", href: buildWhatsAppUrl(), sub: "Mon–Sat, 9am–7pm IST" },
    { icon: Instagram, label: "Instagram", value: "@tvakshri", href: "https://instagram.com/tvakshri", sub: "Follow for daily skincare tips" },
  ];

  return (
    <div className="min-h-screen bg-cream-100">
      <section className="page-hero text-center">
        <div className="container-custom">
          <p className="font-sans text-xs uppercase tracking-widest text-gold-600 font-semibold mb-2">We're Here to Help</p>
          <h1 className="section-title mb-3">Contact Us</h1>
          <div className="gold-divider" />
          <p className="section-subtitle mt-4">Have questions about skincare, orders or ingredients? We'd love to hear from you.</p>

          {/* WhatsApp Hero CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-2xl font-sans text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 group"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <span className="font-sans text-xs text-muted-foreground">Fastest response · Usually within 30 min</span>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-soft">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-herbal-500 mb-4" />
                <h3 className="font-display text-2xl font-semibold mb-2">Message Sent!</h3>
                <p className="font-sans text-muted-foreground">Thank you for reaching out. We'll respond within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="btn-outline mt-6">Send Another Message</button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-semibold mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-sans text-sm font-medium block mb-1.5">Name</label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Your name" required />
                    </div>
                    <div>
                      <label className="font-sans text-sm font-medium block mb-1.5">Email</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="your@email.com" required />
                    </div>
                  </div>
                  <div>
                    <label className="font-sans text-sm font-medium block mb-1.5">Subject</label>
                    <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" required>
                      <option value="">Select a topic</option>
                      <option>Order Issue</option>
                      <option>Product Question</option>
                      <option>Skincare Advice</option>
                      <option>Return / Refund</option>
                      <option>Bulk / Wholesale</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-sans text-sm font-medium block mb-1.5">Message</label>
                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="input-field resize-none" placeholder="Tell us how we can help..." required />
                  </div>
                  <button type="submit" className="btn-primary w-full py-4">Send Message</button>
                </form>
              </>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Quick WhatsApp topics */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366] flex-shrink-0" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <h3 className="font-sans text-sm font-semibold text-[#15803d]">Quick WhatsApp Topics</h3>
              </div>
              <p className="font-sans text-xs text-[#166534] mb-3">Tap a topic to open WhatsApp with a pre-filled message:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "My Order",         topic: "order" },
                  { label: "Product Query",     topic: "product" },
                  { label: "Skincare Advice",   topic: "skincare advice" },
                  { label: "Return / Refund",   topic: "return or refund" },
                  { label: "Coupon / Offer",    topic: "coupon or offer" },
                  { label: "Bulk Order",        topic: "bulk order" },
                ].map(({ label, topic }) => (
                  <a
                    key={topic}
                    href={buildWhatsAppUrl(topic)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#86efac] hover:bg-[#25D366] hover:text-white hover:border-[#25D366] text-[#15803d] rounded-full font-sans text-xs font-semibold transition-all duration-150"
                  >
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current flex-shrink-0" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold mb-6">Get in Touch</h2>
              <div className="space-y-4">
                {contacts.map(({ icon: Icon, label, value, href, sub }) => (
                  <a key={label} href={href} target={href.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer"
                    className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-soft hover:shadow-card hover:border-gold-300 border border-transparent transition-all group">
                    <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500 transition-colors">
                      <Icon className="w-5 h-5 text-gold-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                      <p className="font-sans text-base font-semibold text-foreground">{value}</p>
                      <p className="font-sans text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-gold-500" />
                <h3 className="font-display text-base font-semibold">Support Hours</h3>
              </div>
              <div className="space-y-1.5">
                {[["Monday – Friday", "9:00 AM – 7:00 PM IST"], ["Saturday", "10:00 AM – 5:00 PM IST"], ["Sunday", "Closed (email only)"]].map(([day, time]) => (
                  <div key={day} className="flex justify-between font-sans text-sm">
                    <span className="text-muted-foreground">{day}</span>
                    <span className="font-medium text-foreground">{time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-cream-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-sm font-semibold text-foreground mb-1">Headquarters</p>
                  <p className="font-sans text-sm text-muted-foreground">TVAKSHRI Beauty Pvt. Ltd.<br />Andheri West, Mumbai — 400053<br />Maharashtra, India</p>
                </div>
              </div>
            </div>
          </div> {/* Closing div for <div className="space-y-6"> */}
        </div> {/* Closing div for <div className="grid grid-cols-1 lg:grid-cols-2 gap-12"> */}
      </div> {/* Closing div for <div className="container-custom py-12"> */}
    </div>
  );
}
