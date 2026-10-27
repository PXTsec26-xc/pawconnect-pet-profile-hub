import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'wouter';
import {
  MapPin,
  Building2,
  Heart,
  Share2,
  Check,
  ShieldCheck,
  HeartHandshake,
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  color?: string;
  weight?: string;
  vaccinated: boolean;
  neutered: boolean;
  description: string;
  personality?: string;
  medicalHistory?: string;
  imageUrl: string;
  images?: string[];
  city: string;
  status: string;
  shelterId?: number;
  shelterName?: string;
}

interface Shelter {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  visitTiming?: string;
  description?: string;
}

export function PetDetail() {
  const params = useParams<{ id: string }>();
  const petId = parseInt(params.id || '1', 10);
  const { user } = useAuth();

  const { data: pet, isLoading, error } = useQuery<Pet>({
    queryKey: ['pet', petId],
    queryFn: () => fetchJson<Pet>(`/api/pets/${petId}`),
  });

  const { data: shelter } = useQuery<Shelter>({
    queryKey: ['shelter', pet?.shelterId],
    queryFn: () => fetchJson<Shelter>(`/api/shelters/${pet?.shelterId}`),
    enabled: !!pet?.shelterId,
  });

  const toggleFavorite = async () => {
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Adopt ${pet?.name} on PawConnect`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-serif font-bold mb-4">Pet Not Found</h2>
        <p className="text-muted-foreground mb-6">The pet you are looking for does not exist or has been removed.</p>
        <Link href="/pets">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pets
          </Button>
        </Link>
      </div>
    );
  }

  const personalities = pet.personality ? pet.personality.split(',').map((p) => p.trim()) : [];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Link */}
      <Link href="/pets" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Pets
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Photos */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-muted border border-border shadow-lg">
            <img
              src={pet.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${pet.id}`}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge variant={pet.status === 'available' ? 'default' : 'secondary'} className="px-3 py-1 text-sm font-semibold capitalize">
                {pet.status}
              </Badge>
            </div>
            <div className="absolute top-4 right-4 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {pet.city}
            </div>
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-4xl font-serif font-bold text-foreground">{pet.name}</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleShare} className="rounded-full">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={toggleFavorite} className="rounded-full hover:text-red-500">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              {pet.breed} • {pet.age} • {pet.gender}
            </p>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-card rounded-2xl border border-border text-center">
            <div>
              <p className="text-xs text-muted-foreground">Size</p>
              <p className="font-semibold text-sm mt-0.5">{pet.size}</p>
            </div>
            <div className="border-x border-border">
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="font-semibold text-sm mt-0.5">{pet.weight || 'Medium'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Color</p>
              <p className="font-semibold text-sm mt-0.5">{pet.color || 'Mixed'}</p>
            </div>
          </div>

          {/* Medical Specs Badges */}
          <div className="flex flex-wrap gap-2">
            {pet.vaccinated && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-medium">
                <ShieldCheck className="h-3.5 w-3.5" /> Vaccinated
              </span>
            )}
            {pet.neutered && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-medium">
                <Check className="h-3.5 w-3.5" /> Neutered / Spayed
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-medium">
              <HeartHandshake className="h-3.5 w-3.5" /> House Trained
            </span>
          </div>

          {/* Personality Tags */}
          {personalities.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Personality</h3>
              <div className="flex flex-wrap gap-2">
                {personalities.map((trait, idx) => (
                  <Badge key={idx} variant="secondary">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* About Pet */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-2">About {pet.name}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {pet.description}
            </p>
          </div>

          {/* Medical History */}
          {pet.medicalHistory && (
            <div>
              <h3 className="text-sm font-semibold mb-1">Health Status & Medical History</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{pet.medicalHistory}</p>
            </div>
          )}

          {/* Adopt Button */}
          <div className="pt-4">
            {pet.status === 'adopted' ? (
              <Button disabled className="w-full h-12 text-base rounded-full">
                Already Adopted
              </Button>
            ) : (
              <Link href={`/adopt/${pet.id}`}>
                <Button size="lg" className="w-full h-14 text-base font-semibold rounded-full shadow-lg shadow-primary/20">
                  Adopt {pet.name}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Shelter Card Section */}
      <div className="mt-16 pt-12 border-t border-border">
        <h2 className="text-2xl font-serif font-bold mb-6">Shelter Info</h2>
        <Card className="bg-card">
          <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl">{pet.shelterName || shelter?.name || 'Local Shelter Partner'}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {shelter?.address || '123 Rescue Way'}, {shelter?.city || pet.city}
                </p>
                {shelter?.visitTiming && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Visiting Hours: {shelter.visitTiming}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {shelter?.phone && (
                <a href={`tel:${shelter.phone}`}>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Phone className="mr-2 h-4 w-4" /> {shelter.phone}
                  </Button>
                </a>
              )}
              {shelter?.email && (
                <a href={`mailto:${shelter.email}`}>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Mail className="mr-2 h-4 w-4" /> Email Shelter
                  </Button>
                </a>
              )}
              <Link href="/shelters">
                <Button size="sm" className="w-full sm:w-auto">
                  View Shelter Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
