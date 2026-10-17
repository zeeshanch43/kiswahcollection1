import { createFileRoute } from "@tanstack/react-router";
import { ReviewsView } from "@/components/ReviewsView";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Customer Reviews — Kiswah Collection" },
      {
        name: "description",
        content: "Read verified customer reviews from fragrance connoisseurs across Pakistan about Kiswah Collection.",
      },
    ],
  }),
  component: ReviewsView,
});
