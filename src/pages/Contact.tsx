import { useState } from "react";
import { Mail, MessageCircle, Instagram, MapPin, Clock, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => setSent(true), 800);
  };

  const contacts = [
    { icon: Mail, label: "Email", value: "support@tvakshri.com", href: "mailto:support@tvakshri.com", sub: "We reply within 24 hours" },
    { icon: MessageCircle, label: "WhatsApp", value: "+91 98765 43210", href: "https://wa.me/919876543210", sub: "Mon–Sat, 9am–7pm IST" },
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
          </div>
        </div>
      </div>
    </div>
  );
}
