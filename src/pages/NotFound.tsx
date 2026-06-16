import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center py-16">
      <div className="text-center max-w-md px-4">
        <div className="font-display text-8xl font-bold text-gold-200 mb-4">404</div>
        <h1 className="font-display text-3xl font-semibold text-foreground mb-3">Page Not Found</h1>
        <p className="font-sans text-muted-foreground mb-8">This page seems to have wandered into the botanical garden and got lost. Let's guide you back.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary gap-2"><Home className="w-4 h-4" /> Go Home</Link>
          <button onClick={() => window.history.back()} className="btn-outline gap-2"><ArrowLeft className="w-4 h-4" /> Go Back</button>
        </div>
      </div>
    </div>
  );
}
