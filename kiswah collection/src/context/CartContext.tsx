import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { PRODUCTS, type Product } from "@/lib/products";

export type CartItem = {
  product: Product;
  qty: number;
};

export type DrawerView = "closed" | "cart" | "checkout" | "success";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  count: number;
  total: number;
  drawerView: DrawerView;
  setDrawerView: (view: DrawerView) => void;
  openCart: () => void;
  openCheckout: () => void;
  closeDrawer: () => void;
  activeProduct: Product | null;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "kiswah_cart_items";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Re-hydrate with current product definitions to preserve object references
            return parsed
              .map((item: { id: string; qty: number }) => {
                const prod = PRODUCTS.find((p) => p.id === item.id);
                return prod ? { product: prod, qty: item.qty } : null;
              })
              .filter(Boolean) as CartItem[];
          }
        }
      } catch {
        // Ignore localStorage error
      }
    }
    return [];
  });

  const [drawerView, setDrawerView] = useState<DrawerView>("closed");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const serialized = cart.map((i) => ({ id: i.product.id, qty: i.qty }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
      } catch {
        // ignore
      }
    }
  }, [cart]);

  const addToCart = (product: Product, qty = 1) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, { product, qty }];
    });
    setActiveProduct(null);
    setDrawerView("cart");
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const setQty = (productId: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((item) => item.product.id !== productId)
        : prev.map((item) =>
            item.product.id === productId ? { ...item, qty } : item
          )
    );
  };

  const clearCart = () => setCart([]);

  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.qty * item.product.price, 0);

  const openCart = () => setDrawerView("cart");
  const openCheckout = () => setDrawerView("checkout");
  const closeDrawer = () => setDrawerView("closed");

  const openProductModal = (product: Product) => setActiveProduct(product);
  const closeProductModal = () => setActiveProduct(null);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        setQty,
        clearCart,
        count,
        total,
        drawerView,
        setDrawerView,
        openCart,
        openCheckout,
        closeDrawer,
        activeProduct,
        openProductModal,
        closeProductModal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
