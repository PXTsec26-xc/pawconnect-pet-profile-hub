import { useState } from 'react';
import { AlertTriangle, CheckCircle2, PhoneCall, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchJson } from '@/lib/api';

export function RescueReport() {
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterPhone: '',
    location: '',
    urgency: 'high' as 'low' | 'medium' | 'high' | 'critical',
    description: '',
    imageUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetchJson<{ report: { id: number }; message: string }>('/api/rescue', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setSubmittedId(response.report.id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit rescue report. Please try again or call emergency hotline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <Card className="p-8 bg-card shadow-xl border-border">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-serif font-bold mb-3">Rescue Report Received</CardTitle>
          <CardDescription className="text-base text-muted-foreground mb-6">
            Your report ticket <span className="font-semibold text-foreground">#RESCUE-{submittedId}</span> has been broadcast to partner shelter rescue dispatch teams in your area.
          </CardDescription>
          <p className="text-xs text-muted-foreground mb-8">
            A rescue volunteer may call your phone number ({formData.reporterPhone}) for real-time location details if needed.
          </p>
          <Button onClick={() => setSubmittedId(null)}>
            Submit Another Report
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <AlertTriangle className="h-4 w-4" /> Emergency Rescue Protocol
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-3">Report an Animal in Need</h1>
        <p className="text-muted-foreground text-base">
          If you see an injured, abused, or abandoned animal, alert our partner rescue networks immediately.
        </p>
      </div>

      {/* Hotline Notice */}
      <div className="mb-8 p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <PhoneCall className="h-5 w-5 text-accent" />
          <div>
            <p className="text-sm font-semibold">Immediate Life Threat?</p>
            <p className="text-xs text-muted-foreground">For critical situations, call our 24/7 hotline directly: 1-800-PAW-HELP</p>
          </div>
        </div>
        <a href="tel:18007294357">
          <Button size="sm" variant="outline" className="text-accent border-accent hover:bg-accent/10">
            Call Dispatch
          </Button>
        </a>
      </div>

      {/* Form Card */}
      <Card className="bg-card shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-serif font-bold">Rescue Report Form</CardTitle>
          <CardDescription>
            Provide as much accurate detail as possible to help rescuers locate the animal quickly.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Name *</label>
                <Input
                  name="reporterName"
                  value={formData.reporterName}
                  onChange={handleChange}
                  required
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number *</label>
                <Input
                  type="tel"
                  name="reporterPhone"
                  value={formData.reporterPhone}
                  onChange={handleChange}
                  required
                  placeholder="(555) 987-6543"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Precise Location *</label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="E.g., Intersection of Main St & 5th Ave, behind the grocery store"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Urgency Level *</label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                required
                className="w-full h-10 px-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="low">Low - Stray, appears healthy</option>
                <option value="medium">Medium - Stray, looks thin/scared</option>
                <option value="high">High - Injured but mobile</option>
                <option value="critical">Critical - Non-mobile, severe injury</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Condition Description & Animal Details *
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe the animal (type, color, size) and what you observed about their condition..."
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Photo URL (Optional)
              </label>
              <Input
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Link to an image if you have one"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isSubmitting ? 'Transmitting Emergency Report...' : 'Submit Emergency Report'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
