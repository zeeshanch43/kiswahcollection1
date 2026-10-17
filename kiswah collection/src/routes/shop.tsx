import { createFileRoute } from "@tanstack/react-router";
import { ShopView } from "@/components/ShopView";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Collection — Kiswah Collection" },
      {
        name: "description",
        content: "Explore our collection of 100% authentic Saudi ouds, attars, and Arabian perfumes.",
      },
    ],
  }),
  component: ShopView,
});
