import { Link } from 'wouter';
import { Heart, Shield, Users, Sparkles, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function About() {
  return (
    <div className="w-full">
      {/* Hero Banner */}
      <section className="bg-primary/5 py-24 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-5xl font-serif font-bold mb-6 text-foreground">
            Every pet deserves a <span className="text-primary italic">second chance.</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            PawConnect is dedicated to eliminating pet homelessness by connecting compassionate individuals and families with rescue shelters across the nation.
          </p>
        </div>
      </section>

      {/* Why Adopt Not Shop */}
      <section className="py-20 container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-bold mb-4">Why Adopt, Not Shop?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            When you adopt from a shelter or rescue, you aren't just gaining a loving companion—you are saving a life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 bg-card border-border hover:shadow-lg transition-all text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Heart className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">Save a Life</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Millions of healthy, loving pets enter shelters every year. Adopting gives them a second lease on life and frees up space for another pet in need.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:shadow-lg transition-all text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
              <Shield className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">Stop Unethical Breeding</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By choosing adoption over pet stores or commercial breeders, you take a firm stand against puppy mills and exploitative breeding practices.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:shadow-lg transition-all text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">Join a Community</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Become part of a compassionate network of shelter volunteers, veterinarians, and loving foster families committed to animal welfare.
            </p>
          </Card>
        </div>
      </section>

      {/* Adoption Process Step-by-Step */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">The PawConnect Adoption Process</h2>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold mb-1">Explore & Filter</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Search through hundreds of verified profiles by breed, size, location, and compatibility with children or other pets.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold mb-1">Submit Application</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fill out our standardized, simple adoption form detailing your home environment and lifestyle.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold mb-1">Meet & Greet</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The shelter reviews your request and invites you to meet your prospective furry family member in person or virtually.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold mb-1">Welcome Home</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Finalize the adoption paperwork, receive veterinary records, and welcome your new lifelong friend into their forever home!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4 max-w-4xl text-center">
        <h2 className="text-3xl font-serif font-bold mb-4">Ready to open your home?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Start your adoption journey today. Browse our available pets or connect with a local shelter.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/pets">
            <Button size="lg" className="rounded-full">
              View Adoptable Pets
            </Button>
          </Link>
          <Link href="/shelters">
            <Button size="lg" variant="outline" className="rounded-full">
              Find a Shelter
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="ghost" className="rounded-full">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
