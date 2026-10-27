import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useLocation } from 'wouter';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchJson } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Pet {
  id: number;
  name: string;
  breed: string;
  imageUrl: string;
  city: string;
  age: string;
  status: string;
}

export function AdoptForm() {
  const params = useParams<{ petId: string }>();
  const petId = parseInt(params.petId || '1', 10);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: pet } = useQuery<Pet>({
    queryKey: ['pet', petId],
    queryFn: () => fetchJson<Pet>(`/api/pets/${petId}`),
  });

  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    occupation: '',
    housingType: '',
    petExperience: '',
    reason: '',
    agreement: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.agreement) {
      setError('You must agree to the terms and certify that all information is accurate.');
      return;
    }

    if (!formData.housingType) {
      setError('Please select your housing type.');
      return;
    }

    if (!formData.petExperience) {
      setError('Please select your pet ownership experience.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetchJson<{ application: { id: number }; message: string }>('/api/adoptions', {
        method: 'POST',
        body: JSON.stringify({
          petId,
          ...formData,
        }),
      });

      setSubmittedId(response.application.id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit adoption application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="text-center p-8 bg-card border-border shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-serif font-bold mb-3">Application Submitted!</CardTitle>
          <CardDescription className="text-base text-muted-foreground mb-6">
            Thank you for applying to adopt {pet?.name || 'this pet'}! Your application ID is <span className="font-semibold text-foreground">#{submittedId}</span>. The shelter team will review your application and contact you soon.
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setLocation('/dashboard')}>
              Track Application in Dashboard
            </Button>
            <Button variant="outline" onClick={() => setLocation('/pets')}>
              Browse More Pets
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Back button */}
      <Link href={`/pets/${petId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Pet Details
      </Link>

      {/* Pet Summary Banner */}
      {pet && (
        <Card className="mb-8 overflow-hidden bg-card border-border">
          <div className="flex items-center gap-4 p-4">
            <img
              src={pet.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${pet.id}`}
              alt={pet.name}
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Applying to Adopt</p>
              <h2 className="text-2xl font-serif font-bold text-foreground">{pet.name}</h2>
              <p className="text-sm text-muted-foreground">
                {pet.breed} • {pet.age} • {pet.city}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Application Form */}
      <Card className="bg-card shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-serif font-bold">Adoption Application</CardTitle>
          <CardDescription>
            Please provide accurate details so the shelter can match you with {pet?.name || 'this pet'}.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-3 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-foreground border-b border-border pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name *</label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email *</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number *</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Occupation *</label>
                  <Input
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    required
                    placeholder="Software Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Address *</label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="123 Oak Street, Apt 4B, City, State ZIP"
                />
              </div>
            </div>

            {/* Section 2: Lifestyle & Environment */}
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-foreground border-b border-border pb-2">
                Lifestyle & Environment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Housing Type *</label>
                  <select
                    name="housingType"
                    value={formData.housingType}
                    onChange={handleChange}
                    required
                    className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select housing type</option>
                    <option value="House with fenced yard">House with fenced yard</option>
                    <option value="House without fence">House without fence</option>
                    <option value="Apartment / Condo">Apartment / Condo</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Pet Ownership Experience *</label>
                  <select
                    name="petExperience"
                    value={formData.petExperience}
                    onChange={handleChange}
                    required
                    className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select experience level</option>
                    <option value="First-time owner">First-time owner</option>
                    <option value="Previous pet owner">Previous pet owner</option>
                    <option value="Current pet owner">Current pet owner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Why do you want to adopt {pet?.name || 'this pet'}? *
                </label>
                <textarea
                  name="reason"
                  rows={4}
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  placeholder="Tell us about your home, family, daily routine, and why you feel you would be a great fit for this companion..."
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Section 3: Agreement */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreement"
                  checked={formData.agreement}
                  onChange={handleChange}
                  required
                  className="h-4 w-4 rounded border-input text-primary mt-1"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I certify that all statements in this application are true and correct. I understand that submitting this application does not guarantee adoption approval.
                </span>
              </label>
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base rounded-full">
                {isSubmitting ? 'Submitting Application...' : 'Submit Adoption Application'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
