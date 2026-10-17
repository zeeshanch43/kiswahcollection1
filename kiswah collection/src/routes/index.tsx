import { createFileRoute } from "@tanstack/react-router";
import { ShopView } from "@/components/ShopView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kiswah Collection — Authentic Saudi Perfumes, Attars & Ouds" },
      { name: "description", content: "100% authentic fragrances imported directly from Saudi Arabia. Ouds, attars and Arabian perfumes with Cash on Delivery across Pakistan." },
      { property: "og:title", content: "Kiswah Collection — Authentic Saudi Fragrances" },
      { property: "og:description", content: "Imported Saudi ouds, attars and perfumes. COD across Pakistan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopView,
});

