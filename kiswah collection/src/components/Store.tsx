import { useMemo, useState } from "react";
import { z } from "zod";
import { FAMILIES, PRODUCTS, formatPKR, type Family, type Product } from "@/lib/products";

const ORDER_ENDPOINT = "http://127.0.0.1:8000/api/orders";
const WHATSAPP = "923000000000"; // placeholder number

type CartItem = { product: Product; qty: number };
type View = "closed" | "cart" | "checkout" | "success";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z.string().trim().regex(/^(\+92|0)3\d{2}[- ]?\d{7}$/, "Enter a valid mobile number, e.g. 03001234567"),
  address: z.string().trim().min(10, "Please enter your full address").max(500),
});

function Img({ src, alt, className = "" }: { src?: string | null | undefined; alt: string; className?: string }) {
  return src ? <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} /> : <div className={`img-slot ${className}`}>Image</div>;
}

export function Store() {
  const [filter, setFilter] = useState<Family | "All">("All");
  const [active, setActive] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [view, setView] = useState<View>("closed");

  const list = useMemo(() => (filter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.family === filter)), [filter]);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * i.product.price, 0);

  const add = (p: Product) => {
    setCart((c) => (c.some((i) => i.product.id === p.id) ? c.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i)) : [...c, { product: p, qty: 1 }]));
    setActive(null);
    setView("cart");
  };
  const setQty = (id: string, qty: number) =>
    setCart((c) => (qty <= 0 ? c.filter((i) => i.product.id !== id) : c.map((i) => (i.product.id === id ? { ...i, qty } : i))));

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-sm">
          <a href="#" className="font-display text-xl">Kiswah Collection</a>
          <nav className="hidden gap-8 text-muted-foreground md:flex">
            <a href="#collection" className="hover:text-foreground">Shop</a>
            <a href="#about" className="hover:text-foreground">About</a>
            <a href="#reviews" className="hover:text-foreground">Reviews</a>
          </nav>
          <button onClick={() => setView("cart")} className="hover:underline">Cart ({count})</button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="text-sm text-muted-foreground">Imported from Riyadh &amp; Makkah</p>
          <h1 className="mt-4 text-5xl leading-[1.05] md:text-6xl">100% authentic fragrances, imported directly from Saudi Arabia.</h1>
          <p className="mt-6 max-w-md text-muted-foreground">Ouds, attars and perfumes. Cash on delivery anywhere in Pakistan.</p>
          <a href="#collection" className="btn-solid mt-8 inline-block">Shop Collection</a>
        </div>
        <Img src={null} alt="Featured bottle" className="aspect-[4/5] w-full" />
      </section>

      <section id="collection" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
          <h2 className="text-3xl">The Collection</h2>
          <div className="flex flex-wrap gap-5 text-sm">
            {(["All", ...FAMILIES] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={filter === f ? "text-foreground underline underline-offset-8" : "text-muted-foreground hover:text-foreground"}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => (
            <article key={p.id} onClick={() => setActive(p)} className="group cursor-pointer">
              <Img src={p.images[0]} alt={p.name} className="aspect-[4/5] w-full" />
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="text-xl group-hover:underline">{p.name}</h3>
                <span className="text-sm">{formatPKR(p.price)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{p.family} · {p.volume}</p>
              <Notes notes={p.notes} />
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="border-y">
        <div className="mx-auto grid max-w-6xl md:grid-cols-3">
          {[
            ["Direct Saudi imports", "Sourced from fragrance houses in Riyadh and Makkah. Sealed and batch-coded."],
            ["Cash on delivery", "Pay at your door. Available in every city in Pakistan."],
            ["Delivered in 2–5 days", "Packed carefully and shipped nationwide."],
          ].map(([t, d], i) => (
            <div key={t} className="border-b p-8 md:border-b-0 md:border-r md:last:border-r-0">
              <span className="text-sm text-muted-foreground">0{i + 1}</span>
              <h3 className="mt-3 text-2xl">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="reviews" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-10 text-3xl">What customers say</h2>
        <div className="grid gap-10 md:grid-cols-3">
          {[
            ["Ayesha K.", "Lahore", "Ward Taifi is exactly like the one I bought in Jeddah."],
            ["Hamza R.", "Karachi", "Amber Oud lasts the whole day. Finally a store I trust."],
            ["Fatima S.", "Islamabad", "Paying on delivery made it easy. The attar is pure and rich."],
          ].map(([n, c, r]) => (
            <figure key={n} className="border-t pt-6">
              <blockquote className="font-display text-xl leading-snug">“{r}”</blockquote>
              <figcaption className="mt-4 text-sm text-muted-foreground">{n}, {c}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl justify-between px-6 py-8 text-sm text-muted-foreground">
          <span>© Kiswah Collection</span>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="hover:text-foreground">WhatsApp</a>
        </div>
      </footer>

      {active && <ProductModal product={active} onClose={() => setActive(null)} onAdd={add} />}
      {view !== "closed" && (
        <Drawer view={view} setView={setView} cart={cart} total={total} setQty={setQty} onPlaced={() => { setCart([]); setView("success"); }} />
      )}
    </div>
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

function ProductModal({ product: p, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (p: Product) => void }) {
  const [img, setImg] = useState(0);
  const hours = ["", "2–3 hrs", "4–5 hrs", "6–8 hrs", "8–10 hrs", "12+ hrs"][p.longevity];
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-overlay p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto bg-popover md:grid-cols-2">
        <button onClick={onClose} className="absolute right-5 top-4 z-10 text-sm hover:underline">Close</button>
        <div className="p-5">
          <Img src={p.images[img]} alt={p.name} className="aspect-[4/5] w-full" />
          <div className="mt-3 grid grid-cols-3 gap-3">
            {p.images.map((src, i) => (
              <button key={i} onClick={() => setImg(i)} className={`border ${i === img ? "border-foreground" : "border-transparent"}`}>
                <Img src={src} alt={`${p.name} view ${i + 1}`} className="aspect-square w-full" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col p-8 pt-12">
          <p className="text-sm text-muted-foreground">{p.family} · {p.volume}</p>
          <h2 className="mt-1 text-4xl">{p.name}</h2>
          <p className="mt-2 text-lg">{formatPKR(p.price)}</p>
          <p className="mt-6 leading-relaxed text-muted-foreground">{p.description}</p>
          <Notes notes={p.notes} />
          <div className="mt-6 border-t pt-3 text-xs">
            <div className="mb-2 flex justify-between"><span className="text-muted-foreground">Longevity</span><span>{hours}</span></div>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((n) => <div key={n} className={`h-1 ${n <= p.longevity ? "bg-foreground" : "bg-muted"}`} />)}
            </div>
          </div>
          <button onClick={() => onAdd(p)} className="btn-solid mt-8 w-full">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

function Drawer({ view, setView, cart, total, setQty, onPlaced }: {
  view: View; setView: (v: View) => void; cart: CartItem[]; total: number; setQty: (id: string, q: number) => void; onPlaced: () => void;
}) {
  const [form, setForm] = useState({ fullName: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const r = checkoutSchema.safeParse(form);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch(ORDER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { full_name: r.data.fullName, phone: r.data.phone, address: r.data.address },
          items: cart.map((i) => ({ id: i.product.id, name: i.product.name, volume: i.product.volume, price: i.product.price, quantity: i.qty })),
          total,
          currency: "PKR",
          payment_method: "COD",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      onPlaced();
      setForm({ fullName: "", phone: "", address: "" });
    } catch {
      setServerError("We couldn't place your order. Please try again or message us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  const title = view === "checkout" ? "Checkout" : view === "success" ? "Thank you" : "Cart";

  return (
    <div className="fixed inset-0 z-50 bg-overlay" onClick={() => setView("closed")}>
      <aside onClick={(e) => e.stopPropagation()} className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-popover animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <h2 className="text-2xl">{title}</h2>
          <button onClick={() => setView("closed")} className="text-sm hover:underline">Close</button>
        </div>

        {view === "success" ? (
          <div className="flex flex-1 flex-col justify-center p-8">
            <h3 className="text-3xl">Your order has been received.</h3>
            <p className="mt-3 text-muted-foreground">We'll call you shortly to confirm. You'll pay cash on delivery.</p>
            <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi, I just placed an order on Kiswah Collection.")}`} target="_blank" rel="noreferrer" className="btn-solid mt-8 text-center">
              Chat on WhatsApp
            </a>
            <button onClick={() => setView("closed")} className="btn-line mt-3">Continue shopping</button>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center p-8">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <button onClick={() => setView("closed")} className="btn-line mt-6">Browse the collection</button>
          </div>
        ) : view === "cart" ? (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-6">
              {cart.map(({ product: p, qty }) => (
                <li key={p.id} className="flex gap-4 py-5">
                  <Img src={p.images[0]} alt={p.name} className="h-24 w-20 shrink-0" />
                  <div className="flex-1">
                    <p className="font-display text-lg">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.volume}</p>
                    <div className="mt-3 flex items-center gap-3 text-sm">
                      <button onClick={() => setQty(p.id, qty - 1)} className="h-7 w-7 border">−</button>
                      <span>{qty}</span>
                      <button onClick={() => setQty(p.id, qty + 1)} className="h-7 w-7 border">+</button>
                    </div>
                  </div>
                  <p className="text-sm">{formatPKR(p.price * qty)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t p-6">
              <div className="mb-4 flex justify-between text-sm"><span>Subtotal</span><span>{formatPKR(total)}</span></div>
              <button onClick={() => setView("checkout")} className="btn-solid w-full">Checkout</button>
            </div>
          </>
        ) : (
          <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto p-6" noValidate>
            {([["fullName", "Full name", "text"], ["phone", "Phone number", "tel"]] as const).map(([k, label, type]) => (
              <label key={k} className="mb-5 block">
                <span className="block text-xs text-muted-foreground">{label}</span>
                <input type={type} className="field" value={form[k]} maxLength={100} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={k === "phone" ? "03001234567" : ""} />
                {errors[k] && <span className="mt-1 block text-xs text-destructive">{errors[k]}</span>}
              </label>
            ))}
            <label className="mb-6 block">
              <span className="block text-xs text-muted-foreground">Full shipping address</span>
              <textarea rows={3} className="field resize-none" maxLength={500} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House, street, area, city" />
              {errors["address"] && <span className="mt-1 block text-xs text-destructive">{errors["address"]}</span>}
            </label>
            <div className="border-t pt-4 text-sm">
              <p className="mb-2 text-xs text-muted-foreground">Order summary</p>
              {cart.map(({ product: p, qty }) => (
                <div key={p.id} className="flex justify-between py-1"><span>{p.name} × {qty}</span><span>{formatPKR(p.price * qty)}</span></div>
              ))}
              <div className="flex justify-between py-1 text-muted-foreground"><span>Shipping</span><span>Free</span></div>
              <div className="mt-2 flex justify-between border-t pt-2 font-medium"><span>Total (cash on delivery)</span><span>{formatPKR(total)}</span></div>
            </div>
            {serverError && <p className="mt-4 text-sm text-destructive">{serverError}</p>}
            <div className="mt-auto flex gap-3 pt-6">
              <button type="button" onClick={() => setView("cart")} className="btn-line">Back</button>
              <button type="submit" disabled={submitting} className="btn-solid flex-1">{submitting ? "Placing…" : "Place order"}</button>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}
