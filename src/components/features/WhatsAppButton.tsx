import { MessageCircle } from "lucide-react";

export const WhatsAppButton = () => (
  <a
    href="https://wa.me/919876543210?text=Hi%20TVAKSHRI%2C%20I%20need%20help%20with%20skincare%20advice%20or%20my%20order."
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#128C7E] transition-all duration-200 hover:scale-105 active:scale-95 group"
    aria-label="Chat on WhatsApp"
  >
    <MessageCircle className="w-5 h-5 fill-white" />
    <span className="font-sans text-sm font-semibold max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
      Chat with us
    </span>
  </a>
);
