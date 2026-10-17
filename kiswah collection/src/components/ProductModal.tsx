import { useState } from "react";
import { formatPKR, type Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";

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

function Img({ src, alt, className = "" }: { src?: string | null | undefined; alt: string; className?: string }) {
  return src ? (
    <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />
  ) : (
    <div className={`img-slot ${className}`}>Image</div>
  );
}

export function ProductModal() {
  const { activeProduct: p, closeProductModal, addToCart } = useCart();
  const [img, setImg] = useState(0);

  if (!p) return null;

  const hours = ["", "2–3 hrs", "4–5 hrs", "6–8 hrs", "8–10 hrs", "12+ hrs"][p.longevity];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-overlay p-4" onClick={closeProductModal}>
      <div onClick={(e) => e.stopPropagation()} className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto bg-popover md:grid-cols-2">
        <button onClick={closeProductModal} className="absolute right-5 top-4 z-10 text-sm hover:underline">
          Close
        </button>
        <div className="p-5">
          <Img src={p.images[img]} alt={p.name} className="aspect-[4/5] w-full" />
          <div className="mt-3 grid grid-cols-3 gap-3">
            {p.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setImg(i)}
                className={`border ${i === img ? "border-foreground" : "border-transparent"}`}
              >
                <Img src={src} alt={`${p.name} view ${i + 1}`} className="aspect-square w-full" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col p-8 pt-12">
          <p className="text-sm text-muted-foreground">
            {p.family} · {p.volume}
          </p>
          <h2 className="mt-1 text-4xl">{p.name}</h2>
          <p className="mt-2 text-lg">{formatPKR(p.price)}</p>
          <p className="mt-6 leading-relaxed text-muted-foreground">{p.description}</p>
          <Notes notes={p.notes} />
          <div className="mt-6 border-t pt-3 text-xs">
            <div className="mb-2 flex justify-between">
              <span className="text-muted-foreground">Longevity</span>
              <span>{hours}</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className={`h-1 ${n <= p.longevity ? "bg-foreground" : "bg-muted"}`} />
              ))}
            </div>
          </div>
          <button onClick={() => addToCart(p)} className="btn-solid mt-8 w-full">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
