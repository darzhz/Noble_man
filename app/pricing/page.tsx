import Link from 'next/link';
import Header from '@/components/header/Header';
import { UploadProvider } from '@/lib/uploadContext';

const canvasOptions = [
  {
    name: 'Classic Canvas',
    size: '16 x 20 in',
    price: 299,
    description: 'A premium portrait size for bedrooms, offices, and gallery walls.',
  },
  {
    name: 'Royal Canvas',
    size: '20 x 24 in',
    price: 370,
    description: 'A larger statement piece with more presence above a mantle or sofa.',
    badge: 'Most Popular',
  },
  {
    name: 'Grand Canvas',
    size: '30 x 40 in',
    price: 590,
    description: 'A large gallery-style centerpiece for maximum royal drama.',
  },
] as const;

const canvasDetails = [
  '100% hand-painted oil on canvas by master artists',
  'Painted from your approved Nobilified portrait concept',
  'Premium canvas, rich detail, and heirloom presentation',
  'Includes a high-resolution digital copy',
  'Ships ready for real-world admiration',
] as const;

export default function PricingPage() {
  return (
    <UploadProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Pricing</h1>
            <p className="text-muted-foreground text-lg">
              Choose a hand-painted canvas for the wall, or keep the digital masterpiece for instant download.
            </p>
          </div>

          <section className="mt-10 rounded-lg border-2 border-primary bg-primary/5 p-5 md:p-8">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                Hand-Painted Canvas
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Real oil paint, real canvas, real presence.
              </h2>
              <p className="mt-3 text-muted-foreground">
                After your portrait is generated, commission our artists to turn it into a hand-painted canvas in the size that fits your wall.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {canvasOptions.map((option) => (
                <div
                  key={option.name}
                  className="relative rounded-lg border border-border bg-background p-5 shadow-sm"
                >
                  {option.badge && (
                    <div className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                      {option.badge}
                    </div>
                  )}
                  <div className="pr-20 md:pr-0">
                    <h3 className="font-serif text-2xl font-bold text-foreground">{option.name}</h3>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">{option.size}</p>
                  </div>
                  <div className="mt-5 text-4xl font-bold text-primary">
                    ${option.price}
                    <span className="text-sm font-normal text-muted-foreground">.00</span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 rounded-lg border border-border bg-background/70 p-5 text-sm text-muted-foreground md:grid-cols-2">
              {canvasDetails.map((detail) => (
                <div key={detail} className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            <div className="mt-7 text-center">
              <Link
                href="/"
                className="inline-flex rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start With Your Portrait
              </Link>
            </div>
          </section>

          <section className="mt-8 rounded-lg border border-border bg-card p-5 md:p-8">
            <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Digital Option
                </p>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                  HD Digital Download
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Full-resolution, unwatermarked digital file delivered instantly after checkout. Ideal for sharing, printing at home, or keeping a clean copy of your royal portrait.
                </p>
                <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                  <li>✓ No watermark</li>
                  <li>✓ Instant delivery</li>
                  <li>✓ High-resolution file</li>
                </ul>
              </div>

              <div className="rounded-lg bg-secondary p-5 text-center md:min-w-44">
                <div className="text-4xl font-bold text-foreground">
                  $20
                  <span className="text-sm font-normal text-muted-foreground">.00</span>
                </div>
                <p className="mt-1 text-xs font-medium text-muted-foreground">one-time purchase</p>
              </div>
            </div>
          </section>

          <div className="hidden">
            {/* Digital Only */}
            <div className="p-8 rounded-2xl border border-border bg-card">
              <h3 className="font-serif text-2xl font-bold mb-2">Digital Masterpiece</h3>
              <div className="text-4xl font-bold mb-4">$20<span className="text-sm font-normal text-muted-foreground">.00</span></div>
              <p className="text-muted-foreground mb-6">High-resolution digital file ready to print or share instantly.</p>
              <ul className="text-left space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2">✓ 4K Resolution</li>
                <li className="flex items-center gap-2">✓ Turnaround in seconds</li>
                <li className="flex items-center gap-2">✓ Multiple style variations</li>
              </ul>
              <button className="w-full py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors">
                Get Started
              </button>
            </div>

            {/* Canvas Print */}
            <div className="p-8 rounded-2xl border-2 border-primary bg-primary/5 relative">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2">Hand-Painted Canvas</h3>
              <div className="text-4xl font-bold mb-4">from $299<span className="text-sm font-normal text-muted-foreground">.00</span></div>
              <p className="text-muted-foreground mb-6">Gallery-quality gallery-wrapped canvas delivered to your door.</p>
              <ul className="text-left space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2">✓ Everything in Digital</li>
                <li className="flex items-center gap-2">✓ Museum-grade canvas</li>
                <li className="flex items-center gap-2">✓ Free global shipping</li>
              </ul>
              <button className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors relative z-10">
                Get Started
              </button>
            </div>
          </div>
        </main>
      </div>
    </UploadProvider>
  );
}
