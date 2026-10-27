import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { PawPrint, MapPin, Building2, ArrowRight, Heart, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchJson } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Pet {
  id: number;
  name: string;
  breed: string;
  age: string;
  gender: string;
  city: string;
  imageUrl: string;
  shelterName: string;
}

interface Stats {
  petsAdopted: number;
  availablePets: number;
  sheltersCount: number;
  happyFamilies: number;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  count: number;
}

export function Home() {
  const { user } = useAuth();

  const { data: featuredPets, isLoading: petsLoading } = useQuery<Pet[]>({
    queryKey: ['featuredPets'],
    queryFn: () => fetchJson<Pet[]>('/api/pets/featured'),
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: () => fetchJson<Stats>('/api/pets/stats'),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetchJson<Category[]>('/api/categories'),
  });

  const toggleFavorite = async (e: React.MouseEvent, petId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      await fetchJson('/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ petId }),
      });
      alert('Saved to your favorites!');
    } catch (err: any) {
      alert(err.message || 'Failed to favorite');
    }
  };

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-primary/5 pb-20 pt-32 lg:pt-48">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6"
            >
              Find Your <span className="text-primary italic font-serif">Forever Friend</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Every rescue pet has a story. Be the beginning of their happily ever after. Browse hundreds of adoptable animals looking for a loving home.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link href="/pets">
                <Button size="lg" className="rounded-full text-base h-14 px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                  Meet the Pets
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="rounded-full text-base h-14 px-8 bg-background/50 backdrop-blur">
                  How it Works
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="absolute top-1/2 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl -z-10" />
      </section>

      {/* 2. Stats Banner */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border">
            {statsLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))
            ) : stats ? (
              <>
                <div className="px-4">
                  <p className="text-4xl font-serif font-bold text-primary mb-2">
                    {stats.petsAdopted.toLocaleString()}+
                  </p>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                    Pets Adopted
                  </p>
                </div>
                <div className="px-4">
                  <p className="text-4xl font-serif font-bold text-accent mb-2">
                    {stats.availablePets.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                    Looking for Home
                  </p>
                </div>
                <div className="px-4">
                  <p className="text-4xl font-serif font-bold text-primary mb-2">
                    {stats.sheltersCount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                    Partner Shelters
                  </p>
                </div>
                <div className="px-4">
                  <p className="text-4xl font-serif font-bold text-accent mb-2">
                    {stats.happyFamilies.toLocaleString()}+
                  </p>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                    Happy Families
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* 3. Category Browser */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold font-serif mb-2">Looking for someone specific?</h2>
              <p className="text-muted-foreground">Browse by category to find your perfect match.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categoriesLoading ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
            ) : (
              categories?.map((cat) => (
                <Link key={cat.id} href={`/pets?type=${cat.name}`}>
                  <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer group h-full bg-card/50">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3 h-full">
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                        {cat.icon === 'dog' ? '🐕' : cat.icon === 'cat' ? '🐈' : cat.icon === 'bird' ? '🦜' : cat.icon === 'rabbit' ? '🐇' : '🐾'}
                      </span>
                      <div>
                        <h3 className="font-medium text-lg">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground">{cat.count} available</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. Meet Our Stars / Featured Pets */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold font-serif mb-2">Meet Our Stars</h2>
              <p className="text-muted-foreground">These lovely companions have been waiting a while.</p>
            </div>
            <Link href="/pets" className="hidden sm:flex items-center gap-2 text-primary font-medium hover:underline">
              View all pets <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {petsLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-2xl" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : (
              featuredPets?.map((pet) => (
                <Link key={pet.id} href={`/pets/${pet.id}`}>
                  <Card className="overflow-hidden border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group h-full flex flex-col cursor-pointer">
                    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                      <img
                        src={pet.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${pet.id}`}
                        alt={pet.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-background/80 backdrop-blur px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {pet.city}
                      </div>
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold font-serif text-foreground">{pet.name}</h3>
                        <span className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground font-medium">
                          {pet.age}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {pet.breed} • {pet.gender}
                      </p>
                      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {pet.shelterName}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => toggleFavorite(e, pet.id)}
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
          <div className="mt-10 text-center sm:hidden">
            <Link href="/pets">
              <Button variant="outline" className="w-full rounded-full">
                View all pets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-serif mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10" />
            <div className="relative flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-8 ring-background">
                <PawPrint className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Find Your Match</h3>
              <p className="text-muted-foreground max-w-xs">
                Browse our adorable pets and find the one that steals your heart and fits your lifestyle.
              </p>
            </div>
            <div className="relative flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-6 ring-8 ring-background">
                <FileText className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Submit Application</h3>
              <p className="text-muted-foreground max-w-xs">
                Fill out a simple adoption form. Our shelter partners will review it to ensure a great fit.
              </p>
            </div>
            <div className="relative flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-8 ring-background">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Take Them Home</h3>
              <p className="text-muted-foreground max-w-xs">
                Meet your new best friend, complete the paperwork, and start your new life together!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
