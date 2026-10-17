import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { FAMILIES, PRODUCTS, formatPKR, type Family, type Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";

function Img({ src, alt, className = "" }: { src?: string | null | undefined; alt: string; className?: string }) {
  return src ? (
    <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />
  ) : (
    <div className={`img-slot ${className}`}>Image</div>
  );
}

function Notes({ notes }: { notes: Product["notes"] }) {
  return (
    <dl className="mt-3 grid grid-cols-3 border-t pt-3 text-xs">
      {(["top", "heart", "base"] as const).map((k) => (
        <div key={k}>
          <dt className="capitalize text-muted-foreground">{k}</dt>
          <dd className="mt-0.5 truncate">{notes[k]}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ShopView() {
  const [filter, setFilter] = useState<Family | "All">("All");
  const { openProductModal, addToCart } = useCart();

  const list = useMemo(
    () => (filter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.family === filter)),
    [filter]
  );

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="text-sm text-muted-foreground">Imported from Riyadh &amp; Makkah</p>
          <h1 className="mt-4 text-5xl leading-[1.05] md:text-6xl">
            100% authentic fragrances, imported directly from Saudi Arabia.
          </h1>
          <p className="mt-6 max-w-md text-muted-foreground">
            Ouds, attars and perfumes. Cash on delivery anywhere in Pakistan.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <a href="#collection" className="btn-solid inline-block">
              Shop Collection
            </a>
            <Link to="/about" className="btn-line inline-block">
              Learn More
            </Link>
          </div>
        </div>
        <Img src={null} alt="Featured bottle" className="aspect-[4/5] w-full" />
      </section>

      {/* Collection Grid */}
      <section id="collection" className="mx-auto max-w-6xl px-6 py-16 scroll-mt-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-3xl">The Collection</h2>
            <p className="text-xs text-muted-foreground mt-1">Showing {list.length} handcrafted fragrances</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm">
            {(["All", ...FAMILIES] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? "text-foreground underline underline-offset-8 font-medium"
                    : "text-muted-foreground hover:text-foreground transition-colors"
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => (
            <article key={p.id} className="group">
              <div
                onClick={() => openProductModal(p)}
                className="cursor-pointer overflow-hidden relative"
              >
                <Img src={p.images[0]} alt={p.name} className="aspect-[4/5] w-full transition-transform duration-300 group-hover:scale-102" />
                <span className="absolute bottom-2 right-2 bg-background/90 text-[10px] uppercase tracking-wider px-2 py-0.5 border">
                  Quick View
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <h3
                  onClick={() => openProductModal(p)}
                  className="text-xl group-hover:underline cursor-pointer"
                >
                  {p.name}
                </h3>
                <span className="text-sm font-medium">{formatPKR(p.price)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {p.family} · {p.volume}
              </p>
              <Notes notes={p.notes} />
              <button
                onClick={() => addToCart(p)}
                className="mt-4 w-full py-2 border text-xs tracking-wider uppercase hover:bg-foreground hover:text-background transition-colors"
              >
                Add to Cart
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
