import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Building2, MapPin, Phone, Mail, Globe, Clock, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchJson } from '@/lib/api';

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
  imageUrl?: string;
  petCount?: number;
}

export function Shelters() {
  const { data: shelters, isLoading } = useQuery<Shelter[]>({
    queryKey: ['shelters'],
    queryFn: () => fetchJson<Shelter[]>('/api/shelters'),
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl font-serif font-bold mb-4">Our Partner Shelters</h1>
        <p className="text-lg text-muted-foreground">
          We partner with reputable animal rescues and shelters to help connect loving pets with forever families.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shelters?.map((shelter) => (
            <Card key={shelter.id} className="overflow-hidden bg-card border-border hover:shadow-lg transition-all flex flex-col">
              <div className="h-48 overflow-hidden bg-muted relative">
                <img
                  src={shelter.imageUrl || 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=600&q=80'}
                  alt={shelter.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow">
                  <PawPrint className="h-3.5 w-3.5 text-primary" />
                  <span>{shelter.petCount || 5} Pets Available</span>
                </div>
              </div>

              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-2">{shelter.name}</h2>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {shelter.description || 'Dedicated to saving and rehoming companion animals in our community.'}
                  </p>

                  <div className="space-y-2 text-xs text-muted-foreground mb-6">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{shelter.address}, {shelter.city}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{shelter.phone}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{shelter.email}</span>
                    </p>
                    {shelter.visitTiming && (
                      <p className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{shelter.visitTiming}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                  <Link href="/pets" className="flex-1">
                    <Button variant="default" className="w-full text-xs">
                      View Available Pets
                    </Button>
                  </Link>
                  {shelter.website && (
                    <a href={shelter.website} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Globe className="h-3.5 w-3.5 mr-1.5" /> Visit Website
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
