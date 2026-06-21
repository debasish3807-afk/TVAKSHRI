import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect } from "react";

import { AuthProvider } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/features/WhatsAppButton";
import { NewsletterPopup } from "@/components/features/NewsletterPopup";
import { AISkinCareChat } from "@/components/features/AISkinCareChat";
import { ProtectedRoute } from "@/components/features/ProtectedRoute";

// Eagerly loaded — critical path
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import Login from "@/pages/Login";

// Lazy loaded — non-critical path (code splitting)
const Checkout     = lazy(() => import("@/pages/Checkout"));
const OrderSuccess = lazy(() => import("@/pages/OrderSuccess"));
const About        = lazy(() => import("@/pages/About"));
const Contact      = lazy(() => import("@/pages/Contact"));
const FAQ          = lazy(() => import("@/pages/FAQ"));
const PrivacyPolicy   = lazy(() => import("@/pages/PrivacyPolicy"));
const ShippingPolicy  = lazy(() => import("@/pages/ShippingPolicy"));
const RefundPolicy    = lazy(() => import("@/pages/RefundPolicy"));
const Admin           = lazy(() => import("@/pages/Admin"));
const Signup          = lazy(() => import("@/pages/Signup"));
const ForgotPassword  = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword   = lazy(() => import("@/pages/ResetPassword"));
const Account         = lazy(() => import("@/pages/Account"));
const TrackOrder      = lazy(() => import("@/pages/TrackOrder"));
const NotFound        = lazy(() => import("@/pages/NotFound"));

// Full-page suspense fallback — matches brand cream bg
function PageLoader() {
  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center animate-pulse shadow-gold">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-14 4 0 0-1 3 1 6 1.08-1.35 2.21-2.63 3.5-3.69L8 14c.82-3.58 3.86-5.26 9-6z"/>
          </svg>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
};

const HIDE_FOOTER_ROUTES = ["/admin"];
const HIDE_NAV_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];
const HIDE_CHAT_ROUTES = ["/admin", "/checkout", "/login", "/signup", "/forgot-password", "/reset-password"];

const AppLayout = () => {
  const { pathname } = useLocation();
  const hideNav = HIDE_NAV_ROUTES.some((r) => pathname.startsWith(r));
  const hideFooter = HIDE_FOOTER_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthPage = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const hideChat = HIDE_CHAT_ROUTES.some((r) => pathname.startsWith(r));
  const isShopOrHome = pathname === "/" || pathname.startsWith("/shop") || pathname.startsWith("/product");

  return (
    <>
      <ScrollToTop />
      {!hideNav && !isAuthPage && <Navbar />}
      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Eagerly loaded */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />

            {/* Lazy loaded */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/track-order" element={<TrackOrder />} />

            {/* Auth Routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!hideFooter && !isAuthPage && <Footer />}
      {/* Floating elements */}
      {!hideFooter && !isAuthPage && <WhatsAppButton />}
      {!hideChat && <AISkinCareChat />}
      {isShopOrHome && <NewsletterPopup />}
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster richColors position="top-center" duration={3500} />
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
