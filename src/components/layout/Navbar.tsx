import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, Search, Menu, X, Leaf, User, LogOut, ChevronDown, Package, Moon, Sun } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useDarkMode } from "@/hooks/useDarkMode";
import { authService } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const { dark, toggle: toggleDark } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    try {
      await authService.signOut();
      logout();
      toast.success("Signed out");
      navigate("/");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const avatarLetter = user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 dark:bg-foreground/95 backdrop-blur-md shadow-soft"
            : "bg-transparent"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group" aria-label="TVAKSHRI Home">
              <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform">
                <Leaf className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div>
                <span className="font-display text-xl font-semibold tracking-wider text-foreground">TVAKSHRI</span>
                <p className="text-[10px] font-sans text-muted-foreground tracking-widest uppercase -mt-1 hidden sm:block">Luxury Herbal Skincare</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8" role="menubar">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  role="menuitem"
                  className={cn(
                    "font-sans text-sm font-medium transition-colors hover:text-gold-600 relative group",
                    location.pathname === l.to ? "text-gold-600" : "text-foreground"
                  )}
                >
                  {l.label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-0.5 bg-gold-500 transition-all duration-300",
                      location.pathname === l.to ? "w-full" : "w-0 group-hover:w-full"
                    )}
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="btn-ghost p-2 w-10 h-10 rounded-full"
                aria-label="Search"
                aria-expanded={searchOpen}
              >
                <Search className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={toggleDark}
                className="btn-ghost p-2 w-10 h-10 rounded-full"
                aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {dark ? (
                  <Sun className="w-4 h-4 text-gold-400" aria-hidden="true" />
                ) : (
                  <Moon className="w-4 h-4" aria-hidden="true" />
                )}
              </button>

              {/* Wishlist */}
              <Link
                to="/shop?wishlist=true"
                className="btn-ghost p-2 w-10 h-10 rounded-full relative"
                aria-label={`Wishlist (${wishlistCount} items)`}
              >
                <Heart className="w-5 h-5" aria-hidden="true" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" aria-hidden="true">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="btn-ghost p-2 w-10 h-10 rounded-full relative"
                aria-label={`Cart (${totalItems} items)`}
              >
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" aria-hidden="true">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* User Account */}
              {user ? (
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 btn-ghost px-2.5 py-2 rounded-xl h-10"
                    aria-label="Account menu"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-6 h-6 rounded-full bg-gold-gradient flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display text-xs font-bold text-white">{avatarLetter}</span>
                      )}
                    </div>
                    <span className="font-sans text-sm font-medium text-foreground max-w-[80px] truncate hidden lg:block">
                      {user.username}
                    </span>
                    <ChevronDown
                      className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform hidden lg:block", userMenuOpen && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-product border border-border overflow-hidden animate-fade-in z-50"
                      role="menu"
                    >
                      <div className="px-4 py-3 border-b border-border bg-cream-50">
                        <p className="font-sans text-xs font-semibold text-foreground truncate">{user.username}</p>
                        <p className="font-sans text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="py-1" role="none">
                        <Link
                          to="/account"
                          role="menuitem"
                          className="flex items-center gap-3 px-4 py-3 font-sans text-sm text-foreground hover:bg-cream-100 transition-colors"
                        >
                          <Package className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                          My Orders
                        </Link>
                        <Link
                          to="/account"
                          role="menuitem"
                          className="flex items-center gap-3 px-4 py-3 font-sans text-sm text-foreground hover:bg-cream-100 transition-colors"
                        >
                          <User className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                          My Account
                        </Link>
                      </div>
                      <div className="border-t border-border py-1" role="none">
                        <button
                          onClick={handleLogout}
                          role="menuitem"
                          className="w-full flex items-center gap-3 px-4 py-3 font-sans text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" aria-hidden="true" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-2 btn-outline py-2 px-4 text-sm rounded-full"
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  Sign In
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="btn-ghost p-2 w-10 h-10 rounded-full md:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-border bg-white/95 backdrop-blur-md animate-fade-in" role="search">
            <div className="container-custom py-4">
              <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <input
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for face packs, ubtan, exfoliants..."
                  className="input-field pl-11 pr-4"
                  aria-label="Search products"
                />
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-white/98 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" aria-label="Mobile navigation">
            <div className="container-custom py-6 flex flex-col gap-4">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "font-sans text-base font-medium py-3 border-b border-border transition-colors",
                    location.pathname === l.to ? "text-gold-600" : "text-foreground"
                  )}
                >
                  {l.label}
                </Link>
              ))}

              <div className="pt-2 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-display text-sm font-bold text-white">{avatarLetter}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-sans text-sm font-semibold text-foreground">{user.username}</p>
                        <p className="font-sans text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Link to="/account" className="flex items-center gap-2 font-sans text-sm text-foreground hover:text-gold-600 transition-colors py-2">
                      <Package className="w-4 h-4" aria-hidden="true" /> My Account & Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 font-sans text-sm text-rose-500 hover:text-rose-700 transition-colors py-2 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-2 font-sans text-sm font-semibold text-gold-600 hover:text-gold-700 transition-colors py-2">
                      <User className="w-4 h-4" aria-hidden="true" /> Sign In
                    </Link>
                    <Link to="/signup" className="flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                      Create Account
                    </Link>
                  </>
                )}

                {/* Dark mode toggle in mobile menu */}
                <button
                  onClick={toggleDark}
                  className="flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors py-2 w-full text-left"
                >
                  {dark ? (
                    <><Sun className="w-4 h-4" aria-hidden="true" /> Light Mode</>
                  ) : (
                    <><Moon className="w-4 h-4" aria-hidden="true" /> Dark Mode</>
                  )}
                </button>

                <Link
                  to="/track-order"
                  className="font-sans text-sm text-muted-foreground hover:text-gold-600 transition-colors py-2 block"
                >
                  Track My Order
                </Link>
                <Link
                  to="/admin"
                  className="font-sans text-xs text-muted-foreground hover:text-gold-600 transition-colors"
                >
                  Admin Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
      <div className="h-16 md:h-20" aria-hidden="true" />
    </>
  );
};
