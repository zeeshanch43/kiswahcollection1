import { useState } from "react";
import { z } from "zod";
import { formatPKR } from "@/lib/products";
import { useCart } from "@/context/CartContext";

const ORDER_ENDPOINT = "http://127.0.0.1:8000/api/orders";
const WHATSAPP = "923000000000";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z.string().trim().regex(/^(\+92|0)3\d{2}[- ]?\d{7}$/, "Enter a valid mobile number, e.g. 03001234567"),
  address: z.string().trim().min(10, "Please enter your full address").max(500),
});

function Img({ src, alt, className = "" }: { src?: string | null | undefined; alt: string; className?: string }) {
  return src ? (
    <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />
  ) : (
    <div className={`img-slot ${className}`}>Image</div>
  );
}

export function CartDrawer() {
  const {
    cart,
    total,
    drawerView: view,
    setDrawerView: setView,
    closeDrawer,
    setQty,
    clearCart,
  } = useCart();

  const [form, setForm] = useState({ fullName: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  if (view === "closed") return null;

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
          items: cart.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            volume: i.product.volume,
            price: i.product.price,
            quantity: i.qty,
          })),
          total,
          currency: "PKR",
          payment_method: "COD",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      clearCart();
      setView("success");
      setForm({ fullName: "", phone: "", address: "" });
    } catch {
      setServerError("We couldn't place your order automatically. Please order via WhatsApp or try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const title = view === "checkout" ? "Checkout" : view === "success" ? "Thank you" : "Cart";

  return (
    <div className="fixed inset-0 z-50 bg-overlay" onClick={closeDrawer}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-popover animate-in slide-in-from-right duration-300"
      >
        <div className="flex items-center justify-between border-b px-6 py-5">
          <h2 className="text-2xl">{title}</h2>
          <button onClick={closeDrawer} className="text-sm hover:underline">
            Close
          </button>
        </div>

        {view === "success" ? (
          <div className="flex flex-1 flex-col justify-center p-8">
            <h3 className="text-3xl">Your order has been received.</h3>
            <p className="mt-3 text-muted-foreground">
              We'll call you shortly to confirm. You'll pay cash on delivery.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                "Hi, I just placed an order on Kiswah Collection."
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn-solid mt-8 text-center"
            >
              Chat on WhatsApp
            </a>
            <button onClick={closeDrawer} className="btn-line mt-3">
              Continue shopping
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center p-8">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <button onClick={closeDrawer} className="btn-line mt-6">
              Browse the collection
            </button>
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
                      <button onClick={() => setQty(p.id, qty - 1)} className="h-7 w-7 border">
                        −
                      </button>
                      <span>{qty}</span>
                      <button onClick={() => setQty(p.id, qty + 1)} className="h-7 w-7 border">
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-sm">{formatPKR(p.price * qty)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t p-6">
              <div className="mb-4 flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPKR(total)}</span>
              </div>
              <button onClick={() => setView("checkout")} className="btn-solid w-full">
                Checkout
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto p-6" noValidate>
            {([["fullName", "Full name", "text"], ["phone", "Phone number", "tel"]] as const).map(
              ([k, label, type]) => (
                <label key={k} className="mb-5 block">
                  <span className="block text-xs text-muted-foreground">{label}</span>
                  <input
                    type={type}
                    className="field"
                    value={form[k]}
                    maxLength={100}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    placeholder={k === "phone" ? "03001234567" : ""}
                  />
                  {errors[k] && <span className="mt-1 block text-xs text-destructive">{errors[k]}</span>}
                </label>
              )
            )}
            <label className="mb-6 block">
              <span className="block text-xs text-muted-foreground">Full shipping address</span>
              <textarea
                rows={3}
                className="field resize-none"
                maxLength={500}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="House, street, area, city"
              />
              {errors["address"] && (
                <span className="mt-1 block text-xs text-destructive">{errors["address"]}</span>
              )}
            </label>
            <div className="border-t pt-4 text-sm">
              <p className="mb-2 text-xs text-muted-foreground">Order summary</p>
              {cart.map(({ product: p, qty }) => (
                <div key={p.id} className="flex justify-between py-1">
                  <span>
                    {p.name} × {qty}
                  </span>
                  <span>{formatPKR(p.price * qty)}</span>
                </div>
              ))}
              <div className="flex justify-between py-1 text-muted-foreground">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2 font-medium">
                <span>Total (cash on delivery)</span>
                <span>{formatPKR(total)}</span>
              </div>
            </div>
            {serverError && <p className="mt-4 text-sm text-destructive">{serverError}</p>}
            <div className="mt-auto flex gap-3 pt-6">
              <button type="button" onClick={() => setView("cart")} className="btn-line">
                Back
              </button>
              <button type="submit" disabled={submitting} className="btn-solid flex-1">
                {submitting ? "Placing…" : "Place order"}
              </button>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}
