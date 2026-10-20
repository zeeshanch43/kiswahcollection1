import { createFileRoute } from "@tanstack/react-router";
import { AdminView } from "@/components/AdminView";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Kiswah Collection" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminView,
});
