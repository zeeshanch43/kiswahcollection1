import { Link } from "@tanstack/react-router";

const WHATSAPP = "923000000000";

export function Footer() {
  return (
    <footer className="border-t bg-card/40 mt-auto">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row items-center justify-between px-6 py-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-6">
          <span className="font-display text-foreground text-base">Kiswah Collection</span>
          <span>© {new Date().getFullYear()} All rights reserved</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/reviews" className="hover:text-foreground">Reviews</Link>
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground font-medium text-foreground"
          >
            WhatsApp Support
          </a>
        </div>
      </div>
    </footer>
  );
}
