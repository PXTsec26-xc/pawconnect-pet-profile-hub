import { useState } from 'react';
import { Link } from 'wouter';
import { PawPrint } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary fill-primary" />
              <span className="font-serif font-bold text-xl">PawConnect</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Connecting loving families with rescue pets in need of a forever home. Adopt, don't shop.
            </p>
          </div>

          {/* Adopt Col */}
          <div>
            <h3 className="font-serif font-semibold mb-4 text-lg">Adopt</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/pets?type=Dog" className="hover:text-primary transition-colors">
                  Adopt a Dog
                </Link>
              </li>
              <li>
                <Link href="/pets?type=Cat" className="hover:text-primary transition-colors">
                  Adopt a Cat
                </Link>
              </li>
              <li>
                <Link href="/shelters" className="hover:text-primary transition-colors">
                  Find a Shelter
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Adoption Process
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Col */}
          <div>
            <h3 className="font-serif font-semibold mb-4 text-lg">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Pet Care Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/rescue" className="hover:text-primary transition-colors text-accent">
                  Emergency Rescue
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div>
            <h3 className="font-serif font-semibold mb-4 text-lg">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to our newsletter for happy tails and pet care tips.
            </p>
            {subscribed ? (
              <p className="text-sm text-primary font-medium">Thank you for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Button type="submit" size="sm" className="rounded-md">
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} PawConnect. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:underline">Privacy Policy</span>
            <span className="cursor-pointer hover:underline">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
