export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-cream-100">
      <section className="page-hero text-center">
        <div className="container-custom">
          <h1 className="section-title mb-3">Privacy Policy</h1>
          <div className="gold-divider" />
          <p className="section-subtitle mt-4">Last updated: May 2025</p>
        </div>
      </section>
      <div className="container-custom py-12 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-soft p-8 space-y-6 font-sans text-sm text-foreground leading-relaxed">
          {[
            { title: "1. Information We Collect", body: "We collect information you provide directly to us, such as your name, email address, phone number, shipping address and payment details when you place an order. We also collect information automatically when you visit our website, including your IP address, browser type, and browsing behaviour." },
            { title: "2. How We Use Your Information", body: "We use the information we collect to process and fulfil your orders, communicate with you about your orders, send promotional communications (only with your consent), improve our products and services, and comply with legal obligations." },
            { title: "3. Sharing Your Information", body: "We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers (such as payment processors and shipping partners) who assist us in operating our website and conducting our business, subject to confidentiality agreements." },
            { title: "4. Payment Security", body: "All payment transactions are processed through industry-standard SSL encryption. We do not store your complete credit/debit card details on our servers. Payments are handled by secure third-party payment gateways compliant with PCI DSS standards." },
            { title: "5. Cookies", body: "We use cookies to enhance your browsing experience, remember your preferences and analyse website traffic. You can disable cookies in your browser settings, though this may affect some website functionality." },
            { title: "6. Data Retention", body: "We retain your personal data for as long as necessary to fulfil the purposes described in this policy, unless a longer retention period is required or permitted by law. Order information is retained for 7 years for accounting and legal compliance." },
            { title: "7. Your Rights", body: "You have the right to access, correct, or delete your personal information. You may also object to or restrict our processing of your data. To exercise these rights, please contact us at privacy@tvakshri.com." },
            { title: "8. Contact Us", body: "If you have any questions about this Privacy Policy, please contact us at: privacy@tvakshri.com or TVAKSHRI Beauty Pvt. Ltd., Andheri West, Mumbai — 400053, Maharashtra, India." },
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
