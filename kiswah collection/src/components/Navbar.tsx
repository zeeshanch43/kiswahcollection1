import { Link } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const { count, openCart } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-sm">
        <Link to="/" className="font-display text-xl tracking-tight">
          Kiswah Collection
        </Link>
        <nav className="flex gap-8 text-muted-foreground">
          <Link
            to="/shop"
            activeProps={{ className: "text-foreground font-medium underline underline-offset-4" }}
            className="hover:text-foreground transition-colors"
          >
            Shop
          </Link>
          <Link
            to="/about"
            activeProps={{ className: "text-foreground font-medium underline underline-offset-4" }}
            className="hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            to="/reviews"
            activeProps={{ className: "text-foreground font-medium underline underline-offset-4" }}
            className="hover:text-foreground transition-colors"
          >
            Reviews
          </Link>
        </nav>
        <button
          onClick={openCart}
          className="hover:underline flex items-center gap-1.5 font-medium"
        >
          <span>Cart</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-semibold">
            {count}
          </span>
        </button>
      </div>
    </header>
  );
}
