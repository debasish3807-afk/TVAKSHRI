import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Sparkles, Bot, Loader2, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { sanitizeText } from "@/lib/sanitize";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `You are TVAKSHRI's expert AI skincare assistant — warm, knowledgeable, and deeply passionate about Ayurvedic beauty traditions. Your name is "Vaidya AI".

You help customers with:
- Personalized skincare recommendations from the TVAKSHRI product line
- Ayurvedic skincare tips and rituals
- Ingredient explanations (neem, turmeric, rose, ubtan, etc.)
- Skin concern solutions (acne, dryness, pigmentation, aging)
- Usage instructions for TVAKSHRI products
- General Ayurvedic wellness advice

TVAKSHRI Product Line:
1. Neem Detox Face Pack (₹549) — deep pore cleansing, acne control
2. Haldi Bright Face Pack (₹649) — brightening, dark spots, golden glow
3. Rose Glow Face Pack (₹699) — hydration, dewy finish, anti-aging
4. Rice Polish Powder (₹499) — gentle exfoliation, silky skin
5. Multani Purify Face Pack (₹449) — oil control, pore minimizing
6. Bridal Glow Ubtan (₹849) — 21-day bridal ritual, full body

Rules:
- Keep responses concise and friendly (2-4 sentences usually)
- Always recommend TVAKSHRI products where relevant
- Use occasional Ayurvedic terms but always explain them
- If asked about medical conditions, recommend consulting a dermatologist
- Never discuss competitors
- Always be encouraging and positive about natural skincare`;

// Curated local responses for common skin concerns (used as fallback when AI backend unavailable)
function getLocalResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("acne") || q.includes("pimple") || q.includes("breakout"))
    return "For acne-prone skin, our Neem Detox Face Pack (₹549) is perfect! Neem's nimbidin compounds actively combat acne bacteria while sandalwood calms inflammation. Use 2–3 times weekly mixed with rose water. Most customers see clearer skin within 3 weeks! 🌿";
  if (q.includes("glow") || q.includes("bright") || q.includes("dark spot") || q.includes("pigment"))
    return "For radiant, even-toned skin, the Haldi Bright Face Pack (₹649) with Kashmiri saffron and organic turmeric is magical! Curcumin fades dark spots while saffron imparts a golden glow. Mix with milk for best results, use 3x/week. ✨";
  if (q.includes("dry") || q.includes("moistur") || q.includes("hydrat"))
    return "For dehydrated skin, the Rose Glow Face Pack (₹699) with Damask rose petals and rosehip oil is your ideal ritual! Hyaluronic acid microspheres plump fine lines while rose water restores your natural glow. Mix with raw milk for extra nourishment. 🌸";
  if (q.includes("oily") || q.includes("pore") || q.includes("sebum"))
    return "For oily and congested skin, the Multani Purify Face Pack (₹449) absorbs excess sebum and minimises pores beautifully! Premium Fuller's Earth with cooling vetiver draws out impurities. Mix with chilled rose water, leave for 15 min. 🌿";
  if (q.includes("exfoliat") || q.includes("dead skin") || q.includes("smooth"))
    return "The Rice Polish Powder (₹499) is your secret to porcelain-smooth skin! Ultra-fine rice bran with pearl powder and kojic acid gently buffs away dead cells — perfect even for sensitive skin. Use only twice a week! ✨";
  if (q.includes("bridal") || q.includes("wedding") || q.includes("special"))
    return "For your special day, begin the Bridal Glow Ubtan ritual (₹849) 21 days before! 21 premium Ayurvedic ingredients including Kashmiri saffron, kumkumadi and rose petals transform your complexion. This sacred recipe was used in royal Indian bridal ceremonies for centuries. 👑";
  if (q.includes("ingredient") || q.includes("neem") || q.includes("turmeric") || q.includes("haldi"))
    return "TVAKSHRI uses only wild-harvested and organically cultivated ingredients — neem, saffron, sandalwood, turmeric, rose petals, vetiver and more. Every formula follows classical Ayurvedic texts with zero parabens, sulphates or synthetic fragrances. 🌱";
  if (q.includes("routine") || q.includes("how often") || q.includes("when"))
    return "A beautiful Ayurvedic routine: Cleanse daily → Apply face pack 2–3x per week → Moisturise with a botanical oil. Start with our Haldi Bright or Neem pack based on your skin type. Consistency is key — Ayurvedic botanicals work gently but deeply! 🌿";
  return "Beautiful question! TVAKSHRI offers 6 Ayurvedic skincare rituals from ₹449–₹849: Neem Detox (acne), Haldi Bright (glow), Rose Glow (hydration), Rice Polish (exfoliation), Multani Purify (oily skin), and Bridal Ubtan (bridal ritual). Tell me your skin concern and I'll recommend the perfect one! ✨";
}

const QUICK_PROMPTS = [
  "What's best for acne?",
  "How to get glowing skin?",
  "Best for dry skin?",
  "Bridal skincare routine?",
];

export function AISkinCareChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Namaste! 🌿 I'm Vaidya AI, your personal Ayurvedic skincare advisor. Tell me your skin concern and I'll recommend the perfect TVAKSHRI ritual for you!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open) {
      setTimeout(() => setVisible(true), 20);
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setVisible(false);
    }
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = sanitizeText(text.trim());
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build conversation history for context
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let assistantContent = "";

      try {
        const { data, error } = await supabase.functions.invoke("ai-skincare-chat", {
          body: {
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...history,
              { role: "user", content: trimmed },
            ],
          },
        });
        if (error) throw error;
        assistantContent = data?.content || "";
      } catch {
        // Graceful fallback with curated responses when AI backend is unavailable
        assistantContent = getLocalResponse(trimmed);
      }

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: assistantContent || "Could you share more about your skin type? I'd love to recommend the perfect Ayurvedic ritual for you! 🌿",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("AI chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "I'm taking a brief pause. Please try again! 🌿",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-white shadow-gold-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
          aria-label="Open AI Skincare Assistant"
        >
          <Sparkles className="w-6 h-6" aria-hidden="true" />
          {/* Pulse ring */}
          <span
            className="absolute inset-0 rounded-full bg-gold-400/40 animate-ping"
            style={{ animationDuration: "2.5s" }}
            aria-hidden="true"
          />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 rounded-3xl shadow-product overflow-hidden flex flex-col transition-all duration-300",
            minimized ? "h-16" : "h-[520px] sm:h-[560px]",
            visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          )}
          style={{ maxHeight: "calc(100vh - 100px)" }}
          role="dialog"
          aria-label="Vaidya AI Skincare Assistant"
          aria-modal="false"
        >
          {/* Header */}
          <div className="bg-gold-gradient px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-semibold text-white">Vaidya AI</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-herbal-300 animate-pulse" aria-hidden="true" />
                <p className="font-sans text-[11px] text-white/80">Ayurvedic Skin Advisor · Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized((m) => !m)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label={minimized ? "Expand chat" : "Minimize chat"}
              >
                {minimized
                  ? <Maximize2 className="w-4 h-4 text-white" aria-hidden="true" />
                  : <Minimize2 className="w-4 h-4 text-white" aria-hidden="true" />
                }
              </button>
              <button
                onClick={() => { setOpen(false); setVisible(false); }}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4 text-white" aria-hidden="true" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream-50" aria-live="polite" aria-label="Chat messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2.5 animate-fade-up",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center flex-shrink-0 mt-0.5 shadow-gold" aria-hidden="true">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 font-sans text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-gold-500 text-white rounded-tr-sm"
                          : "bg-white text-foreground shadow-soft rounded-tl-sm"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-2.5 animate-fade-in" aria-label="Assistant is typing">
                    <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center flex-shrink-0 mt-0.5 shadow-gold" aria-hidden="true">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-soft flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-gold-500 animate-spin" aria-hidden="true" />
                      <span className="font-sans text-xs text-muted-foreground">Vaidya AI is thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick prompts */}
              {messages.length <= 1 && (
                <div className="px-3 py-2 bg-cream-50 border-t border-border">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {QUICK_PROMPTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="flex-shrink-0 px-3 py-1.5 bg-white border border-gold-200 rounded-full font-sans text-xs text-gold-700 hover:bg-gold-50 hover:border-gold-400 transition-all whitespace-nowrap active:scale-95"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="p-3 bg-white border-t border-border flex items-center gap-2 flex-shrink-0"
                aria-label="Send message"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your skin concern..."
                  className="flex-1 px-4 py-2.5 bg-cream-100 rounded-full font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-cream-200 transition-colors"
                  maxLength={500}
                  disabled={loading}
                  aria-label="Message input"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold hover:shadow-gold-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 text-white" aria-hidden="true" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
