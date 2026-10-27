import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Heart, FileText, Trash2, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchJson } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';

interface Favorite {
  id: number;
  petId: number;
  createdAt: string;
  pet?: {
    id: number;
    name: string;
    breed: string;
    age: string;
    imageUrl: string;
    city: string;
    status: string;
  };
}

interface Adoption {
  id: number;
  petId: number;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
  housingType: string;
  pet?: {
    id: number;
    name: string;
    breed: string;
    imageUrl: string;
    city: string;
  };
}

export function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: favorites, isLoading: favsLoading, refetch: refetchFavs } = useQuery<Favorite[]>({
    queryKey: ['myFavorites'],
    queryFn: () => fetchJson<Favorite[]>('/api/favorites'),
    enabled: !!user,
  });

  const { data: applications, isLoading: appsLoading } = useQuery<Adoption[]>({
    queryKey: ['myAdoptions'],
    queryFn: () => fetchJson<Adoption[]>('/api/adoptions'),
    enabled: !!user,
  });

  const removeFavorite = async (petId: number) => {
    try {
      await fetchJson(`/api/favorites/${petId}`, { method: 'DELETE' });
      refetchFavs();
    } catch (err: any) {
      alert(err.message || 'Failed to remove favorite');
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Skeleton className="h-10 w-48 mx-auto mb-4" />
        <Skeleton className="h-64 w-full max-w-2xl mx-auto rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <h2 className="text-3xl font-serif font-bold mb-4">Please Log In</h2>
        <p className="text-muted-foreground mb-6">You must be logged in to view your saved pets and adoption applications.</p>
        <Link href="/login">
          <Button className="w-full">Go to Login</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-600">Approved</Badge>;
      case 'under_review':
        return <Badge className="bg-amber-600">Under Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Not Approved</Badge>;
      default:
        return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, <span className="font-semibold text-foreground">{user.fullName}</span> ({user.email})
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" /> Saved Pets ({favorites?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> My Applications ({applications?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Saved Pets Tab */}
        <TabsContent value="favorites">
          {favsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-2xl" />
              ))}
            </div>
          ) : !favorites || favorites.length === 0 ? (
            <Card className="text-center p-12 bg-card border-dashed">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-serif font-bold mb-2">No saved pets yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Explore our adoptable pets and save your favorites here.
              </p>
              <Link href="/pets">
                <Button>Browse Pets</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => (
                <Card key={fav.id} className="overflow-hidden bg-card border-border flex flex-col justify-between">
                  {fav.pet && (
                    <>
                      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                        <img
                          src={fav.pet.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${fav.pet.id}`}
                          alt={fav.pet.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-serif font-bold">{fav.pet.name}</h3>
                          <p className="text-xs text-muted-foreground mb-4">
                            {fav.pet.breed} • {fav.pet.age} • {fav.pet.city}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
                          <Link href={`/pets/${fav.pet.id}`}>
                            <Button size="sm">View Pet</Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFavorite(fav.petId)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Adoption Applications Tab */}
        <TabsContent value="applications">
          {appsLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          ) : !applications || applications.length === 0 ? (
            <Card className="text-center p-12 bg-card border-dashed">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-serif font-bold mb-2">No applications yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                When you apply to adopt a pet, you can track the status here.
              </p>
              <Link href="/pets">
                <Button>Find a Pet</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id} className="p-6 bg-card border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {app.pet?.imageUrl ? (
                      <img
                        src={app.pet.imageUrl}
                        alt={app.pet.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold">
                        #{app.petId}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-serif font-bold">
                          Application for {app.pet?.name || `Pet #${app.petId}`}
                        </h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Applied on {formatDate(app.createdAt)} • Housing: {app.housingType}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Link href={`/pets/${app.petId}`}>
                      <Button variant="outline" size="sm">
                        View Pet
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
