import { Link } from "@tanstack/react-router";

export function AboutView() {
  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="border-b bg-card/20 py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">The Essence of Arabia</p>
          <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-normal leading-tight">
            Crafted in Saudi Arabia. Curated for Pakistan.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Kiswah Collection was founded with a singular devotion: bringing genuine, undiluted 
            Saudi ouds, attars, and Arabian perfumery directly to your doorstep with total trust.
          </p>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 border-b pb-4">
          <h2 className="text-3xl">Our Principles</h2>
          <p className="text-sm text-muted-foreground mt-1">Why fragrance connoisseurs trust Kiswah</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            [
              "01",
              "Direct Saudi imports",
              "Every bottle is sourced straight from reputable artisanal fragrance houses in Riyadh and Makkah. Batch-coded, vacuum sealed, and never diluted.",
            ],
            [
              "02",
              "Cash on delivery nationwide",
              "Experience absolute peace of mind. Inspect your sealed package and pay cash only upon safe delivery at your home or office anywhere across Pakistan.",
            ],
            [
              "03",
              "Delivered in 2–5 days",
              "Carefully packed in protective luxury boxes and dispatched quickly via premier courier networks to Karachi, Lahore, Islamabad, and all major cities.",
            ],
          ].map(([num, title, desc]) => (
            <div key={title} className="border p-8 flex flex-col justify-between hover:border-foreground/40 transition-colors">
              <div>
                <span className="font-display text-2xl text-muted-foreground/60">{num}</span>
                <h3 className="mt-4 text-2xl">{title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sourcing and Purity Story */}
      <section className="border-y bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-20 grid gap-12 md:grid-cols-2 items-center">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Artisanal Purity</span>
            <h2 className="mt-2 text-3xl md:text-4xl">Pure Dehn Al Oud &amp; Aged Attars</h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              In Arabian heritage, perfume is not merely a cosmetic—it is an emblem of hospitality, 
              dignity, and spiritual presence. From the sacred roses of Taif in the Hijaz mountains 
              to deep Cambodian agarwood aged over decades, our collection reflects true Arabian olfactory mastery.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We work directly with certified distillers to ensure zero synthetic alcohol fillers 
              in our concentrated attar oils, ensuring remarkable longevity that clings gracefully to fabrics for days.
            </p>
            <div className="mt-8">
              <Link to="/shop" className="btn-solid inline-block">
                Explore The Collection
              </Link>
            </div>
          </div>
          <div className="border p-8 md:p-12 bg-background flex flex-col justify-center space-y-6">
            <h3 className="font-display text-2xl">The Kiswah Authenticity Guarantee</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="font-bold text-foreground">✓</span>
                <span><strong>100% Original Sealed Bottling:</strong> Imported in original retail packaging with authentic security batch seals.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-foreground">✓</span>
                <span><strong>Zero Dilution Policy:</strong> We never decant, tamper, or thin concentrated oils with solvents.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-foreground">✓</span>
                <span><strong>Direct Customer Care:</strong> Real assistance via WhatsApp for fragrance consultations and note profiling.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl">Find your signature scent today</h2>
        <p className="mt-3 text-muted-foreground">Complimentary nationwide shipping with cash on delivery.</p>
        <div className="mt-8">
          <Link to="/shop" className="btn-solid inline-block">
            Shop All Fragrances
          </Link>
        </div>
      </section>
    </div>
  );
}
