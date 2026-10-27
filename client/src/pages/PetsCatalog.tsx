import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Search, MapPin, Building2, Heart, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchJson } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Pet {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  city: string;
  imageUrl: string;
  status: string;
  shelterName: string;
}

interface PetsResponse {
  pets: Pet[];
  total: number;
  page: number;
  pages: number;
}

export function PetsCatalog() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Parse initial query params from URL
  const queryParams = new URLSearchParams(window.location.search);
  const initialType = queryParams.get('type') || 'All Types';

  const [search, setSearch] = useState('');
  const [type, setType] = useState(initialType);
  const [size, setSize] = useState('Any Size');
  const [gender, setGender] = useState('Any Gender');

  // Synchronize when URL search changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlType = params.get('type');
    if (urlType) {
      setType(urlType);
    }
  }, [location]);

  const { data, isLoading } = useQuery<PetsResponse>({
    queryKey: ['pets', type, size, gender, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (type && type !== 'All Types') params.append('type', type);
      if (size && size !== 'Any Size') params.append('size', size);
      if (gender && gender !== 'Any Gender') params.append('gender', gender);
      if (search) params.append('search', search);
      return fetchJson<PetsResponse>(`/api/pets?${params.toString()}`);
    },
  });

  const resetFilters = () => {
    setSearch('');
    setType('All Types');
    setSize('Any Size');
    setGender('Any Gender');
  };

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
    <div className="container mx-auto px-4 py-12">
      {/* Header & Search */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4">Find a Pet</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, breed, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 bg-card"
            />
          </div>
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
          {/* Type filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Pet Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="All Types">All Types</option>
              <option value="Dog">Dogs</option>
              <option value="Cat">Cats</option>
              <option value="Bird">Birds</option>
              <option value="Rabbit">Rabbits</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Size filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="Any Size">Any Size</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
              <option value="Extra Large">Extra Large</option>
            </select>
          </div>

          {/* Gender filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="Any Gender">Any Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="w-full h-10 flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Results summary */}
      <div className="mb-6 flex justify-between items-center text-sm text-muted-foreground">
        <span>Showing {data?.pets.length || 0} adoptable pets</span>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : data?.pets.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border p-8">
          <p className="text-xl font-serif font-semibold mb-2">No pets match your criteria</p>
          <p className="text-muted-foreground mb-6">Try adjusting your filters or search keywords.</p>
          <Button onClick={resetFilters}>Reset All Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.pets.map((pet) => (
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
                  {pet.status === 'adopted' && (
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold uppercase">
                      Adopted
                    </div>
                  )}
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold font-serif text-foreground">{pet.name}</h3>
                    <span className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground font-medium">
                      {pet.age}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {pet.breed} • {pet.gender} • {pet.size}
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
          ))}
        </div>
      )}
    </div>
  );
}
