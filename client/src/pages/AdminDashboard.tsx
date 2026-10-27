import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ShieldAlert, Plus, Check, X, Clock, Trash2, Edit, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { fetchJson } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';

interface Adoption {
  id: number;
  petId: number;
  fullName: string;
  email: string;
  phone: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
  housingType: string;
  pet?: {
    id: number;
    name: string;
    breed: string;
  };
}

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
  shelterName?: string;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPet, setNewPet] = useState({
    name: '',
    type: 'Dog',
    breed: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female',
    size: 'Medium' as 'Small' | 'Medium' | 'Large' | 'Extra Large',
    city: 'San Francisco',
    description: '',
    imageUrl: '',
    shelterName: 'Paws & Love Shelter',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Queries
  const { data: applications, isLoading: appsLoading } = useQuery<Adoption[]>({
    queryKey: ['adminAdoptions'],
    queryFn: () => fetchJson<Adoption[]>('/api/adoptions'),
    enabled: user?.role === 'admin',
  });

  const { data: petsData, isLoading: petsLoading } = useQuery<{ pets: Pet[] }>({
    queryKey: ['adminPets'],
    queryFn: () => fetchJson<{ pets: Pet[] }>('/api/pets?limit=100'),
    enabled: user?.role === 'admin',
  });

  // Actions
  const updateAppStatus = async (id: number, status: string) => {
    try {
      await fetchJson(`/api/adoptions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      queryClient.invalidateQueries({ queryKey: ['adminAdoptions'] });
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const deletePet = async (id: number) => {
    if (!confirm('Are you sure you want to delete this pet listing?')) return;
    try {
      await fetchJson(`/api/pets/${id}`, { method: 'DELETE' });
      queryClient.invalidateQueries({ queryKey: ['adminPets'] });
    } catch (err: any) {
      alert(err.message || 'Failed to delete pet');
    }
  };

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await fetchJson('/api/pets', {
        method: 'POST',
        body: JSON.stringify(newPet),
      });
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ['adminPets'] });
      setNewPet({
        name: '',
        type: 'Dog',
        breed: '',
        age: '',
        gender: 'Male',
        size: 'Medium',
        city: 'San Francisco',
        description: '',
        imageUrl: '',
        shelterName: 'Paws & Love Shelter',
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to add pet');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-3xl font-serif font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">You must have administrator privileges to access this area.</p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage pets, applications, and system settings.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus className="mr-2 h-4 w-4" /> Add New Pet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif font-bold">Add New Pet Listing</DialogTitle>
              <DialogDescription>Enter pet profile details to list for adoption.</DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePet} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Pet Name *</label>
                  <Input
                    required
                    value={newPet.name}
                    onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                    placeholder="Buddy"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Pet Type *</label>
                  <select
                    value={newPet.type}
                    onChange={(e) => setNewPet({ ...newPet, type: e.target.value })}
                    className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Breed *</label>
                  <Input
                    required
                    value={newPet.breed}
                    onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                    placeholder="Golden Retriever"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Age *</label>
                  <Input
                    required
                    value={newPet.age}
                    onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
                    placeholder="2 years"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Gender *</label>
                  <select
                    value={newPet.gender}
                    onChange={(e) => setNewPet({ ...newPet, gender: e.target.value as any })}
                    className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Size *</label>
                  <select
                    value={newPet.size}
                    onChange={(e) => setNewPet({ ...newPet, size: e.target.value as any })}
                    className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
                  >
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="Extra Large">Extra Large</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">City *</label>
                  <Input
                    required
                    value={newPet.city}
                    onChange={(e) => setNewPet({ ...newPet, city: e.target.value })}
                    placeholder="San Francisco"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Image URL *</label>
                <Input
                  required
                  type="url"
                  value={newPet.imageUrl}
                  onChange={(e) => setNewPet({ ...newPet, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Shelter Name</label>
                <Input
                  value={newPet.shelterName}
                  onChange={(e) => setNewPet({ ...newPet, shelterName: e.target.value })}
                  placeholder="Paws & Love Shelter"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={newPet.description}
                  onChange={(e) => setNewPet({ ...newPet, description: e.target.value })}
                  placeholder="Personality, behavior, and backstory..."
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>

              <Button type="submit" className="w-full">
                Add Pet to Database
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="applications">
            Adoption Applications ({applications?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pets">
            Manage Pets ({petsData?.pets.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card className="bg-card border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Pet</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {appsLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8">Loading applications...</td>
                    </tr>
                  ) : !applications || applications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        No applications found.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-foreground">{app.fullName}</p>
                          <p className="text-xs text-muted-foreground">{app.email} • {app.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/pets/${app.petId}`} className="text-primary hover:underline font-medium">
                            {app.pet?.name || `Pet #${app.petId}`}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {formatDate(app.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              app.status === 'approved'
                                ? 'default'
                                : app.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="capitalize"
                          >
                            {app.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppStatus(app.id, 'approved')}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppStatus(app.id, 'rejected')}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Manage Pets Tab */}
        <TabsContent value="pets">
          <Card className="bg-card border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Type / Breed</th>
                    <th className="px-6 py-4">Shelter</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {petsLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8">Loading pets...</td>
                    </tr>
                  ) : petsData?.pets.map((pet) => (
                    <tr key={pet.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={pet.imageUrl}
                          alt={pet.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="font-semibold">{pet.name}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {pet.type} • {pet.breed}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {pet.shelterName || 'PawConnect Shelter'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="capitalize">
                          {pet.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link href={`/pets/${pet.id}`}>
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deletePet(pet.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
