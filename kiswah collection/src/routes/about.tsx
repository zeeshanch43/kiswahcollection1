import { createFileRoute } from "@tanstack/react-router";
import { AboutView } from "@/components/AboutView";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Kiswah Collection" },
      {
        name: "description",
        content: "Learn about Kiswah Collection, our direct Saudi imports from Riyadh & Makkah, and pure artisanal fragrance heritage.",
      },
    ],
  }),
  component: AboutView,
});
