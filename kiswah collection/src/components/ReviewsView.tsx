import { Link } from "@tanstack/react-router";

const WHATSAPP = "923000000000";

const REVIEWS = [
  {
    name: "Ayesha K.",
    city: "Lahore",
    product: "Ward Taifi (50ml)",
    rating: 5,
    date: "Verified Buyer",
    quote: "Ward Taifi is exactly like the one I bought in Jeddah during Umrah. Delicate yet long lasting on abayas. Absolutely authentic.",
  },
  {
    name: "Hamza R.",
    city: "Karachi",
    product: "Amber Oud (100ml)",
    rating: 5,
    date: "Verified Buyer",
    quote: "Amber Oud lasts the whole day through Karachi's weather. The projection is regal without being cloying. Finally an authentic store I can trust.",
  },
  {
    name: "Fatima S.",
    city: "Islamabad",
    product: "Musk Al Tahara (50ml)",
    rating: 5,
    date: "Verified Buyer",
    quote: "Paying cash on delivery made it completely risk-free. The attar is pure, thick, creamy and rich. Ordered a second bottle for my sister.",
  },
  {
    name: "Bilal Tariq",
    city: "Rawalpindi",
    product: "Dahn Al Oud Royale (12ml)",
    rating: 5,
    date: "Verified Buyer",
    quote: "Real aged Cambodian oud oil is hard to find in Pakistan. Two drops on the collar lasted over 24 hours. The packaging was immaculate.",
  },
  {
    name: "Zainab M.",
    city: "Peshawar",
    product: "Jannat Al Firdaus (6ml)",
    rating: 5,
    date: "Verified Buyer",
    quote: "Delivered in 3 days to Peshawar. The green and floral musk balance is calming and reminds me of the holy mosques.",
  },
  {
    name: "Omer Farooq",
    city: "Multan",
    product: "Sandal Majlis (100ml)",
    rating: 5,
    date: "Verified Buyer",
    quote: "Sandal Majlis has that true Saudi cardamom and sandalwood warmth. Excellent customer support on WhatsApp as well.",
  },
];

export function ReviewsView() {
  return (
    <div className="min-h-screen">
      {/* Header Banner */}
      <section className="border-b bg-card/20 py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Client Impressions</p>
          <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-normal leading-tight">
            What Our Customers Say
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Real feedback from verified fragrance lovers across Karachi, Lahore, Islamabad, and nationwide.
          </p>

          {/* Rating Summary Bar */}
          <div className="mt-10 inline-flex flex-wrap items-center justify-center gap-6 border bg-background px-8 py-5">
            <div className="text-center">
              <span className="font-display text-4xl font-normal">4.9</span>
              <span className="text-xs text-muted-foreground block mt-1">out of 5.0</span>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div className="text-left text-sm text-muted-foreground">
              <div className="flex text-amber-600 text-base">★★★★★</div>
              <p className="mt-1">Over 500+ satisfied buyers across Pakistan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <figure
              key={i}
              className="border p-8 flex flex-col justify-between bg-card/20 hover:border-foreground/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span className="text-amber-600 text-sm">{"★".repeat(r.rating)}</span>
                  <span className="border px-2 py-0.5 text-[11px] font-medium">{r.date}</span>
                </div>
                <blockquote className="font-display text-xl leading-snug">
                  “{r.quote}”
                </blockquote>
              </div>
              <div className="mt-6 border-t pt-4">
                <figcaption className="text-sm font-medium text-foreground">
                  {r.name}
                </figcaption>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>{r.city}</span>
                  <span className="italic">{r.product}</span>
                </div>
              </div>
            </figure>
          ))}
        </div>
      </section>

      {/* Share Review / Feedback Box */}
      <section className="border-t bg-card/30">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-3xl">Have you purchased from Kiswah Collection?</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            We value your honest thoughts. Send us your review or unboxing video on WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                "Salam! I would like to share my review for Kiswah Collection:"
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn-solid inline-block"
            >
              Share Review on WhatsApp
            </a>
            <Link to="/shop" className="btn-line inline-block">
              Browse Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
