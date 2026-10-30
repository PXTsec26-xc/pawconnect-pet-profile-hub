import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useRoute, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Users,
  PawPrint,
  HeartHandshake,
  AlertTriangle,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  Check,
  X,
  Clock,
  Trash2,
  Edit,
  AlertCircle,
  Eye,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Activity,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  Menu,
  ChevronRight,
  TrendingUp,
  FileText,
  LifeBuoy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { fetchJson } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';

// ==============================================================================
// TYPES
// ==============================================================================

type TabKey = 'dashboard' | 'users' | 'pets' | 'adoptions' | 'reports' | 'analytics' | 'settings';

interface UserAccount {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  createdAt: string;
}

interface PetRecord {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  size: 'Small' | 'Medium' | 'Large' | 'Extra Large';
  color?: string | null;
  weight?: string | null;
  vaccinated: boolean;
  neutered: boolean;
  description: string;
  personality?: string | null;
  medicalHistory?: string | null;
  imageUrl: string;
  city: string;
  status: 'available' | 'pending' | 'adopted';
  featured?: boolean;
  shelterId?: number;
  shelterName?: string;
  createdAt?: string;
}

interface AdoptionApplication {
  id: number;
  petId: number;
  userId?: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  housingType: string;
  petExperience: string;
  reason: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
  pet?: {
    id: number;
    name: string;
    breed: string;
    type: string;
    imageUrl?: string;
    city?: string;
    shelterName?: string;
  };
}

interface RescueItem {
  id: number;
  reporterName: string;
  reporterPhone: string;
  location: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  imageUrl?: string | null;
  status: 'reported' | 'in_progress' | 'resolved';
  createdAt: string;
}

interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/admin/:tab');

  const activeTab: TabKey = (params?.tab as TabKey) || 'dashboard';

  // Navigation state
  const handleTabChange = (tab: TabKey) => {
    setLocation(`/admin/${tab}`);
    setIsMobileSidebarOpen(false);
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetRecord | null>(null);
  const [viewingAdoption, setViewingAdoption] = useState<AdoptionApplication | null>(null);
  const [viewingContact, setViewingContact] = useState<ContactInquiry | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    actionVariant?: 'destructive' | 'default';
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionLabel: 'Confirm',
    onConfirm: async () => {},
  });

  // Filter & Search states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const [petSearch, setPetSearch] = useState('');
  const [petTypeFilter, setPetTypeFilter] = useState<string>('all');
  const [petStatusFilter, setPetStatusFilter] = useState<string>('all');

  const [adoptionSearch, setAdoptionSearch] = useState('');
  const [adoptionStatusFilter, setAdoptionStatusFilter] = useState<string>('all');

  const [reportSubTab, setReportSubTab] = useState<'rescues' | 'contacts'>('rescues');

  // Form states for Add/Edit Pet
  const defaultPetForm = {
    name: '',
    type: 'Dog',
    breed: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female',
    size: 'Medium' as 'Small' | 'Medium' | 'Large' | 'Extra Large',
    city: 'San Francisco',
    shelterName: 'Paws & Love Shelter',
    imageUrl: '',
    description: '',
    vaccinated: true,
    neutered: true,
    color: '',
    weight: '',
  };
  const [petFormData, setPetFormData] = useState(defaultPetForm);
  const [petFormError, setPetFormError] = useState<string | null>(null);

  // ==============================================================================
  // DATA QUERIES (Real Backend Data)
  // ==============================================================================

  const isAdmin = user?.role === 'admin';

  const { data: usersData, isLoading: usersLoading } = useQuery<{ users: UserAccount[] }>({
    queryKey: ['adminUsers'],
    queryFn: () => fetchJson<{ users: UserAccount[] }>('/api/users'),
    enabled: isAdmin,
  });

  const { data: petsData, isLoading: petsLoading } = useQuery<{ pets: PetRecord[] }>({
    queryKey: ['adminPets'],
    queryFn: () => fetchJson<{ pets: PetRecord[] }>('/api/pets?limit=300'),
    enabled: isAdmin,
  });

  const { data: adoptionsData, isLoading: adoptionsLoading } = useQuery<AdoptionApplication[]>({
    queryKey: ['adminAdoptions'],
    queryFn: () => fetchJson<AdoptionApplication[]>('/api/adoptions'),
    enabled: isAdmin,
  });

  const { data: rescuesData, isLoading: rescuesLoading } = useQuery<RescueItem[]>({
    queryKey: ['adminRescues'],
    queryFn: () => fetchJson<RescueItem[]>('/api/rescue'),
    enabled: isAdmin,
  });

  const { data: contactsData, isLoading: contactsLoading } = useQuery<{ messages: ContactInquiry[] }>({
    queryKey: ['adminContacts'],
    queryFn: () => fetchJson<{ messages: ContactInquiry[] }>('/api/contact'),
    enabled: isAdmin,
  });

  const { data: healthData, isFetching: healthFetching, refetch: refetchHealth } = useQuery<{ status: string; timestamp: string; service: string }>({
    queryKey: ['adminHealth'],
    queryFn: () => fetchJson<{ status: string; timestamp: string; service: string }>('/api/health'),
    enabled: isAdmin,
  });

  const usersList = useMemo(() => usersData?.users || [], [usersData]);
  const petsList = useMemo(() => petsData?.pets || [], [petsData]);
  const adoptionsList = useMemo(() => adoptionsData || [], [adoptionsData]);
  const rescuesList = useMemo(() => rescuesData || [], [rescuesData]);
  const contactsList = useMemo(() => contactsData?.messages || [], [contactsData]);

  // Derived Summary Counts
  const pendingAdoptionsCount = useMemo(() => 
    adoptionsList.filter(a => a.status === 'pending' || a.status === 'under_review').length,
    [adoptionsList]
  );

  const pendingRescuesCount = useMemo(() => 
    rescuesList.filter(r => r.status === 'reported').length,
    [rescuesList]
  );

  const availablePetsCount = useMemo(() => 
    petsList.filter(p => p.status === 'available').length,
    [petsList]
  );

  const adoptedPetsCount = useMemo(() => 
    petsList.filter(p => p.status === 'adopted').length,
    [petsList]
  );

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setActionAlert({ message, type });
    setTimeout(() => {
      setActionAlert(null);
    }, 4000);
  };

  // ==============================================================================
  // ACTIONS: USERS
  // ==============================================================================

  const handleToggleUserRole = (targetUser: UserAccount) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const actionLabel = newRole === 'admin' ? 'Promote to Administrator' : 'Demote to Regular User';

    setConfirmDialog({
      isOpen: true,
      title: `${actionLabel}?`,
      description: `Are you sure you want to change ${targetUser.fullName}'s role to "${newRole}"?`,
      actionLabel: 'Confirm Change',
      actionVariant: 'default',
      onConfirm: async () => {
        try {
          await fetchJson(`/api/users/${targetUser.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ role: newRole }),
          });
          queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
          showAlert(`Updated ${targetUser.fullName}'s role to ${newRole}.`);
        } catch (err: any) {
          showAlert(err.message || 'Failed to update user role', 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleToggleUserStatus = (targetUser: UserAccount) => {
    const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    const actionLabel = newStatus === 'suspended' ? 'Suspend User Account' : 'Reactivate User Account';

    setConfirmDialog({
      isOpen: true,
      title: `${actionLabel}?`,
      description: newStatus === 'suspended' 
        ? `Suspending ${targetUser.fullName} will prevent them from logging into PawConnect.`
        : `Reactivating will restore login access for ${targetUser.fullName}.`,
      actionLabel: newStatus === 'suspended' ? 'Suspend Account' : 'Reactivate Account',
      actionVariant: newStatus === 'suspended' ? 'destructive' : 'default',
      onConfirm: async () => {
        try {
          await fetchJson(`/api/users/${targetUser.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus }),
          });
          queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
          showAlert(`Account status changed to ${newStatus}.`);
        } catch (err: any) {
          showAlert(err.message || 'Failed to update user status', 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDeleteUser = (targetUser: UserAccount) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete User Account?',
      description: `This action will permanently delete ${targetUser.fullName} (${targetUser.email}). This cannot be undone.`,
      actionLabel: 'Delete Permanently',
      actionVariant: 'destructive',
      onConfirm: async () => {
        try {
          await fetchJson(`/api/users/${targetUser.id}`, {
            method: 'DELETE',
          });
          queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
          showAlert(`User ${targetUser.fullName} was permanently deleted.`);
        } catch (err: any) {
          showAlert(err.message || 'Failed to delete user', 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // ==============================================================================
  // ACTIONS: PETS
  // ==============================================================================

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    setPetFormError(null);
    try {
      await fetchJson('/api/pets', {
        method: 'POST',
        body: JSON.stringify({
          ...petFormData,
          images: [petFormData.imageUrl],
        }),
      });
      setIsAddPetOpen(false);
      setPetFormData(defaultPetForm);
      queryClient.invalidateQueries({ queryKey: ['adminPets'] });
      showAlert(`Pet listing "${petFormData.name}" created successfully.`);
    } catch (err: any) {
      setPetFormError(err.message || 'Failed to add pet listing');
    }
  };

  const handleUpdatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPet) return;
    setPetFormError(null);
    try {
      await fetchJson(`/api/pets/${editingPet.id}`, {
        method: 'PATCH',
        body: JSON.stringify(editingPet),
      });
      setEditingPet(null);
      queryClient.invalidateQueries({ queryKey: ['adminPets'] });
      showAlert(`Pet "${editingPet.name}" updated successfully.`);
    } catch (err: any) {
      setPetFormError(err.message || 'Failed to update pet listing');
    }
  };

  const handleQuickPetStatus = async (petId: number, status: 'available' | 'pending' | 'adopted') => {
    try {
      await fetchJson(`/api/pets/${petId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      queryClient.invalidateQueries({ queryKey: ['adminPets'] });
      showAlert(`Pet status updated to ${status}.`);
    } catch (err: any) {
      showAlert(err.message || 'Failed to update pet status', 'error');
    }
  };

  const handleDeletePet = (pet: PetRecord) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Pet Listing?',
      description: `Are you sure you want to delete ${pet.name} (${pet.breed})? This will remove the listing from public search.`,
      actionLabel: 'Delete Pet',
      actionVariant: 'destructive',
      onConfirm: async () => {
        try {
          await fetchJson(`/api/pets/${pet.id}`, {
            method: 'DELETE',
          });
          queryClient.invalidateQueries({ queryKey: ['adminPets'] });
          showAlert(`Pet "${pet.name}" removed from directory.`);
        } catch (err: any) {
          showAlert(err.message || 'Failed to delete pet', 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // ==============================================================================
  // ACTIONS: ADOPTIONS
  // ==============================================================================

  const handleUpdateAdoptionStatus = async (appId: number, status: 'pending' | 'under_review' | 'approved' | 'rejected') => {
    try {
      await fetchJson(`/api/adoptions/${appId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      queryClient.invalidateQueries({ queryKey: ['adminAdoptions'] });
      queryClient.invalidateQueries({ queryKey: ['adminPets'] });
      if (viewingAdoption && viewingAdoption.id === appId) {
        setViewingAdoption(prev => prev ? ({ ...prev, status }) : null);
      }
      showAlert(`Application status updated to ${status.replace('_', ' ')}.`);
    } catch (err: any) {
      showAlert(err.message || 'Failed to update application status', 'error');
    }
  };

  // ==============================================================================
  // ACTIONS: REPORTS & CONTACTS
  // ==============================================================================

  const handleUpdateRescueStatus = async (id: number, status: 'reported' | 'in_progress' | 'resolved') => {
    try {
      await fetchJson(`/api/rescue/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      queryClient.invalidateQueries({ queryKey: ['adminRescues'] });
      showAlert(`Rescue status updated to ${status.replace('_', ' ')}.`);
    } catch (err: any) {
      showAlert(err.message || 'Failed to update rescue status', 'error');
    }
  };

  const handleDeleteRescue = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Emergency Report?',
      description: 'Are you sure you want to remove this dispatch report?',
      actionLabel: 'Delete',
      actionVariant: 'destructive',
      onConfirm: async () => {
        try {
          await fetchJson(`/api/rescue/${id}`, { method: 'DELETE' });
          queryClient.invalidateQueries({ queryKey: ['adminRescues'] });
          showAlert('Rescue report removed.');
        } catch (err: any) {
          showAlert(err.message || 'Failed to delete report', 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDeleteContact = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Inquiry Message?',
      description: 'Are you sure you want to remove this contact submission?',
      actionLabel: 'Delete',
      actionVariant: 'destructive',
      onConfirm: async () => {
        try {
          await fetchJson(`/api/contact/${id}`, { method: 'DELETE' });
          queryClient.invalidateQueries({ queryKey: ['adminContacts'] });
          setViewingContact(null);
          showAlert('Contact message deleted.');
        } catch (err: any) {
          showAlert(err.message || 'Failed to delete contact inquiry', 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // ==============================================================================
  // SECURITY CHECK: ACCESS CONTROL
  // ==============================================================================

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
        <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-3">Administrator Privileges Required</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          The PawConnect Administration Portal is strictly reserved for authorized staff and system administrators.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/login">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl">
              Log in with Admin Account
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full sm:w-auto rounded-xl">
              Return to Website
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // FILTERED LISTS
  // ==============================================================================

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch));
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || (u.status || 'active') === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredPets = petsList.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(petSearch.toLowerCase()) ||
      p.breed.toLowerCase().includes(petSearch.toLowerCase()) ||
      p.city.toLowerCase().includes(petSearch.toLowerCase());
    const matchesType = petTypeFilter === 'all' || p.type.toLowerCase() === petTypeFilter.toLowerCase();
    const matchesStatus = petStatusFilter === 'all' || p.status.toLowerCase() === petStatusFilter.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredAdoptions = adoptionsList.filter(a => {
    const matchesSearch = 
      a.fullName.toLowerCase().includes(adoptionSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(adoptionSearch.toLowerCase()) ||
      (a.pet?.name && a.pet.name.toLowerCase().includes(adoptionSearch.toLowerCase()));
    const matchesStatus = adoptionStatusFilter === 'all' || a.status === adoptionStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // ==============================================================================
  // SIDEBAR NAVIGATION CONFIGURATION
  // ==============================================================================

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'users', label: 'User Management', icon: Users, badge: usersList.length },
    { key: 'pets', label: 'Pet Inventory', icon: PawPrint, badge: petsList.length },
    { key: 'adoptions', label: 'Adoptions', icon: HeartHandshake, badge: pendingAdoptionsCount, badgeVariant: 'primary' },
    { key: 'reports', label: 'Reports & Dispatch', icon: AlertTriangle, badge: pendingRescuesCount, badgeVariant: 'destructive' },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner / Notification */}
      {actionAlert && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 max-w-md transition-all ${
            actionAlert.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800'
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }`}
        >
          {actionAlert.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertCircle className="h-5 w-5 text-destructive shrink-0" />}
          <span className="text-sm font-medium">{actionAlert.message}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Top Header Bar */}
        <div className="mb-6 pb-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="md:hidden p-2 rounded-lg border border-border text-foreground hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <PawPrint className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-2xl text-foreground">PawConnect Admin Portal</h1>
                <Badge variant="outline" className="hidden sm:inline-flex bg-primary/5 text-primary border-primary/20 text-xs">
                  Console v1.2
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Integrated administrative control for pets, users, adoption requests, and emergency dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" /> View Public Site
              </Button>
            </Link>

            <Button
              onClick={() => {
                setPetFormData(defaultPetForm);
                setPetFormError(null);
                setIsAddPetOpen(true);
              }}
              size="sm"
              className="rounded-xl text-xs gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Add New Pet
            </Button>

            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-muted/60 rounded-xl text-xs text-muted-foreground border border-border">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>API Connected</span>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Main Content */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar */}
          <aside
            className={`${
              isMobileSidebarOpen ? 'block' : 'hidden'
            } md:block w-full md:w-64 shrink-0 bg-card border border-border rounded-2xl p-3 shadow-sm space-y-1`}
          >
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Management Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabChange(item.key as TabKey)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : item.badgeVariant === 'destructive'
                          ? 'bg-destructive/10 text-destructive'
                          : item.badgeVariant === 'primary'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Admin User Mini Card */}
            <div className="pt-4 mt-4 border-t border-border px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 border border-primary/20">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{user.fullName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full mt-3 text-xs text-destructive hover:bg-destructive/10 rounded-lg py-1.5 font-medium transition-colors text-center"
              >
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main Workspace Area */}
          <main className="flex-1 min-w-0 w-full space-y-6">

            {/* ============================================================== */}
            {/* TAB 1: DASHBOARD OVERVIEW */}
            {/* ============================================================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* 4 Summary Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1: Users */}
                  <Card className="bg-card border-border shadow-sm rounded-2xl hover:border-primary/40 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Total Users</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                          <Users className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <h2 className="text-3xl font-serif font-bold text-foreground">{usersList.length}</h2>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <span className="text-emerald-600 font-semibold">{usersList.filter(u => u.status !== 'suspended').length} active</span>
                          <span>• {usersList.filter(u => u.role === 'admin').length} admins</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 2: Pets */}
                  <Card className="bg-card border-border shadow-sm rounded-2xl hover:border-primary/40 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Pet Inventory</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                          <PawPrint className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <h2 className="text-3xl font-serif font-bold text-foreground">{petsList.length}</h2>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <span className="text-emerald-600 font-semibold">{availablePetsCount} available</span>
                          <span>• {adoptedPetsCount} adopted</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 3: Adoptions */}
                  <Card className="bg-card border-border shadow-sm rounded-2xl hover:border-primary/40 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Adoption Requests</span>
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <HeartHandshake className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <h2 className="text-3xl font-serif font-bold text-foreground">{adoptionsList.length}</h2>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <span className="text-amber-600 font-semibold">{pendingAdoptionsCount} pending</span>
                          <span>• {adoptionsList.filter(a => a.status === 'approved').length} approved</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 4: Emergency Reports */}
                  <Card className="bg-card border-border shadow-sm rounded-2xl hover:border-primary/40 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Emergency Dispatch</span>
                        <div className="w-8 h-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <h2 className="text-3xl font-serif font-bold text-foreground">{rescuesList.length}</h2>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <span className="text-destructive font-semibold">{pendingRescuesCount} unresolved</span>
                          <span>• {contactsList.length} inquiries</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Action Shortcuts */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-serif font-bold text-foreground mb-3">Quick Administrative Actions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleTabChange('pets')}
                      className="rounded-xl h-auto py-3 px-4 flex flex-col items-center gap-2 hover:border-primary text-xs"
                    >
                      <Plus className="h-4 w-4 text-primary" />
                      <span>Add / Manage Pets</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleTabChange('adoptions')}
                      className="rounded-xl h-auto py-3 px-4 flex flex-col items-center gap-2 hover:border-primary text-xs"
                    >
                      <FileText className="h-4 w-4 text-amber-600" />
                      <span>Review Adoptions ({pendingAdoptionsCount})</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleTabChange('reports')}
                      className="rounded-xl h-auto py-3 px-4 flex flex-col items-center gap-2 hover:border-primary text-xs"
                    >
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span>Rescue Dispatches ({pendingRescuesCount})</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleTabChange('users')}
                      className="rounded-xl h-auto py-3 px-4 flex flex-col items-center gap-2 hover:border-primary text-xs"
                    >
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>Inspect User Accounts</span>
                    </Button>
                  </div>
                </div>

                {/* Grid: Pipeline & Pet Inventory Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Adoption Pipeline */}
                  <Card className="bg-card border-border shadow-sm rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-serif font-bold">Adoption Application Pipeline</CardTitle>
                      <CardDescription className="text-xs">Real-time status of all submitted requests.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {adoptionsList.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center">No adoption applications submitted yet.</p>
                      ) : (
                        ['pending', 'under_review', 'approved', 'rejected'].map(statusKey => {
                          const count = adoptionsList.filter(a => a.status === statusKey).length;
                          const percent = Math.round((count / (adoptionsList.length || 1)) * 100);
                          const color = 
                            statusKey === 'approved' ? 'bg-emerald-500' :
                            statusKey === 'under_review' ? 'bg-blue-500' :
                            statusKey === 'pending' ? 'bg-amber-500' : 'bg-destructive';

                          return (
                            <div key={statusKey} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="capitalize font-medium text-foreground">{statusKey.replace('_', ' ')}</span>
                                <span className="text-muted-foreground">{count} ({percent}%)</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>

                  {/* Species Breakdown */}
                  <Card className="bg-card border-border shadow-sm rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-serif font-bold">Species Distribution</CardTitle>
                      <CardDescription className="text-xs">Breakdown of pets hosted across partner shelters.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {petsList.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center">No pets in directory.</p>
                      ) : (
                        ['Dog', 'Cat', 'Bird', 'Rabbit'].map(species => {
                          const count = petsList.filter(p => p.type.toLowerCase() === species.toLowerCase()).length;
                          const percent = Math.round((count / (petsList.length || 1)) * 100);

                          return (
                            <div key={species} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-medium text-foreground">{species}s</span>
                                <span className="text-muted-foreground">{count} pets ({percent}%)</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity Log */}
                <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="pb-3 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-serif font-bold">Recent System Activity</CardTitle>
                        <CardDescription className="text-xs">Live events recorded in the database.</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">Live Feed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border text-sm">
                      {adoptionsList.slice(0, 5).map(app => (
                        <div key={app.id} className="p-4 hover:bg-muted/40 transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                              <HeartHandshake className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-xs sm:text-sm">
                                Adoption request from <span className="font-semibold">{app.fullName}</span> for {app.pet?.name || `Pet #${app.petId}`}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatDate(app.createdAt)} • {app.email}</p>
                            </div>
                          </div>
                          <Badge
                            variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}
                            className="capitalize text-xs"
                          >
                            {app.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: USER MANAGEMENT */}
            {/* ============================================================== */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                
                {/* Search & Filter Bar */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 rounded-xl text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value as any)}
                      className="h-9 px-3 rounded-xl border border-input bg-card text-xs"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Administrators</option>
                      <option value="user">Regular Users</option>
                    </select>

                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value as any)}
                      className="h-9 px-3 rounded-xl border border-input bg-card text-xs"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <Card className="bg-card border-border rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/60 text-muted-foreground uppercase text-xs font-semibold">
                        <tr>
                          <th className="px-5 py-3.5">User Profile</th>
                          <th className="px-5 py-3.5">Role</th>
                          <th className="px-5 py-3.5">Account Status</th>
                          <th className="px-5 py-3.5">Registered</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {usersLoading ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-muted-foreground">Loading users directory...</td>
                          </tr>
                        ) : filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-muted-foreground">
                              No user accounts found matching your filters.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => {
                            const isCurrentUser = u.id === user.id;
                            const isSuspended = u.status === 'suspended';

                            return (
                              <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                                      {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <p className="font-semibold text-foreground text-sm">{u.fullName}</p>
                                        {isCurrentUser && (
                                          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                            You
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground">{u.email} {u.phone ? `• ${u.phone}` : ''}</p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-5 py-3.5">
                                  <Badge
                                    variant={u.role === 'admin' ? 'default' : 'secondary'}
                                    className="capitalize text-xs font-medium"
                                  >
                                    {u.role}
                                  </Badge>
                                </td>

                                <td className="px-5 py-3.5">
                                  <Badge
                                    variant={isSuspended ? 'destructive' : 'outline'}
                                    className={`capitalize text-xs ${!isSuspended ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/5' : ''}`}
                                  >
                                    {u.status || 'active'}
                                  </Badge>
                                </td>

                                <td className="px-5 py-3.5 text-xs text-muted-foreground">
                                  {formatDate(u.createdAt)}
                                </td>

                                <td className="px-5 py-3.5 text-right space-x-1">
                                  {!isCurrentUser ? (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleToggleUserRole(u)}
                                        className="h-8 text-xs hover:bg-muted"
                                        title={u.role === 'admin' ? 'Demote to regular user' : 'Promote to administrator'}
                                      >
                                        <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                                        {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleToggleUserStatus(u)}
                                        className={`h-8 text-xs ${isSuspended ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'}`}
                                      >
                                        {isSuspended ? <UserCheck className="h-3.5 w-3.5 mr-1" /> : <UserX className="h-3.5 w-3.5 mr-1" />}
                                        {isSuspended ? 'Activate' : 'Suspend'}
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteUser(u)}
                                        className="h-8 text-destructive hover:bg-destructive/10"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </>
                                  ) : (
                                    <span className="text-xs text-muted-foreground italic pr-2">Current Active Admin</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: PET MANAGEMENT */}
            {/* ============================================================== */}
            {activeTab === 'pets' && (
              <div className="space-y-4">
                
                {/* Search & Filter Header */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search pets by name, breed, or city..."
                      value={petSearch}
                      onChange={(e) => setPetSearch(e.target.value)}
                      className="pl-9 rounded-xl text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                    <select
                      value={petTypeFilter}
                      onChange={(e) => setPetTypeFilter(e.target.value)}
                      className="h-9 px-3 rounded-xl border border-input bg-card text-xs"
                    >
                      <option value="all">All Species</option>
                      <option value="dog">Dogs</option>
                      <option value="cat">Cats</option>
                      <option value="bird">Birds</option>
                      <option value="rabbit">Rabbits</option>
                    </select>

                    <select
                      value={petStatusFilter}
                      onChange={(e) => setPetStatusFilter(e.target.value)}
                      className="h-9 px-3 rounded-xl border border-input bg-card text-xs"
                    >
                      <option value="all">All Statuses</option>
                      <option value="available">Available</option>
                      <option value="pending">Pending</option>
                      <option value="adopted">Adopted</option>
                    </select>

                    <Button
                      onClick={() => {
                        setPetFormData(defaultPetForm);
                        setPetFormError(null);
                        setIsAddPetOpen(true);
                      }}
                      size="sm"
                      className="rounded-xl text-xs gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Pet
                    </Button>
                  </div>
                </div>

                {/* Pets Table */}
                <Card className="bg-card border-border rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/60 text-muted-foreground uppercase text-xs font-semibold">
                        <tr>
                          <th className="px-5 py-3.5">Pet</th>
                          <th className="px-5 py-3.5">Species / Breed</th>
                          <th className="px-5 py-3.5">Shelter & Location</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {petsLoading ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-muted-foreground">Loading pet listings...</td>
                          </tr>
                        ) : filteredPets.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-muted-foreground">
                              No pet listings found matching your search criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredPets.map((pet) => (
                            <tr key={pet.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={pet.imageUrl}
                                    alt={pet.name}
                                    className="w-11 h-11 rounded-xl object-cover border border-border shrink-0"
                                  />
                                  <div>
                                    <p className="font-semibold text-foreground text-sm">{pet.name}</p>
                                    <p className="text-xs text-muted-foreground">ID #{pet.id} • {pet.age} • {pet.gender}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-3.5 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">{pet.type}</span> • {pet.breed}
                              </td>

                              <td className="px-5 py-3.5 text-xs text-muted-foreground">
                                <p className="text-foreground font-medium">{pet.shelterName || 'PawConnect Shelter'}</p>
                                <p>{pet.city}</p>
                              </td>

                              <td className="px-5 py-3.5">
                                <select
                                  value={pet.status}
                                  onChange={(e) => handleQuickPetStatus(pet.id, e.target.value as any)}
                                  className="text-xs px-2.5 py-1 rounded-lg border border-border bg-card font-medium capitalize"
                                >
                                  <option value="available">Available</option>
                                  <option value="pending">Pending</option>
                                  <option value="adopted">Adopted</option>
                                </select>
                              </td>

                              <td className="px-5 py-3.5 text-right space-x-1">
                                <Link href={`/pets/${pet.id}`} target="_blank">
                                  <Button size="sm" variant="ghost" className="h-8 px-2" title="View Public Page">
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                </Link>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingPet(pet);
                                    setPetFormError(null);
                                  }}
                                  className="h-8 px-2"
                                  title="Edit Pet Details"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeletePet(pet)}
                                  className="h-8 px-2 text-destructive hover:bg-destructive/10"
                                  title="Delete Pet"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: ADOPTION MANAGEMENT */}
            {/* ============================================================== */}
            {activeTab === 'adoptions' && (
              <div className="space-y-4">
                
                {/* Search & Filter Header */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search applicant or pet name..."
                      value={adoptionSearch}
                      onChange={(e) => setAdoptionSearch(e.target.value)}
                      className="pl-9 rounded-xl text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl">
                    {['all', 'pending', 'under_review', 'approved', 'rejected'].map(statusKey => (
                      <button
                        key={statusKey}
                        onClick={() => setAdoptionStatusFilter(statusKey)}
                        className={`text-xs px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                          adoptionStatusFilter === statusKey
                            ? 'bg-card text-foreground shadow-sm font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {statusKey.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Adoptions Table */}
                <Card className="bg-card border-border rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/60 text-muted-foreground uppercase text-xs font-semibold">
                        <tr>
                          <th className="px-5 py-3.5">Applicant</th>
                          <th className="px-5 py-3.5">Pet Applied For</th>
                          <th className="px-5 py-3.5">Housing & Profile</th>
                          <th className="px-5 py-3.5">Submitted</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {adoptionsLoading ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-muted-foreground">Loading adoption applications...</td>
                          </tr>
                        ) : filteredAdoptions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-muted-foreground">
                              No adoption applications found.
                            </td>
                          </tr>
                        ) : (
                          filteredAdoptions.map((app) => (
                            <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-5 py-3.5">
                                <p className="font-semibold text-foreground text-sm">{app.fullName}</p>
                                <p className="text-xs text-muted-foreground">{app.email} • {app.phone}</p>
                              </td>

                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  {app.pet?.imageUrl && (
                                    <img src={app.pet.imageUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                                  )}
                                  <Link href={`/pets/${app.petId}`} className="text-primary hover:underline font-medium text-xs">
                                    {app.pet?.name || `Pet #${app.petId}`}
                                  </Link>
                                </div>
                              </td>

                              <td className="px-5 py-3.5 text-xs text-muted-foreground">
                                <p className="text-foreground">{app.housingType}</p>
                                <p>{app.petExperience}</p>
                              </td>

                              <td className="px-5 py-3.5 text-xs text-muted-foreground">
                                {formatDate(app.createdAt)}
                              </td>

                              <td className="px-5 py-3.5">
                                <Badge
                                  variant={
                                    app.status === 'approved' ? 'default' :
                                    app.status === 'rejected' ? 'destructive' :
                                    app.status === 'under_review' ? 'secondary' : 'outline'
                                  }
                                  className="capitalize text-xs"
                                >
                                  {app.status.replace('_', ' ')}
                                </Badge>
                              </td>

                              <td className="px-5 py-3.5 text-right space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setViewingAdoption(app)}
                                  className="h-8 text-xs"
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" /> Dossier
                                </Button>

                                {app.status !== 'approved' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateAdoptionStatus(app.id, 'approved')}
                                    className="h-8 text-xs text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                  >
                                    <Check className="h-3.5 w-3.5 mr-1" /> Approve
                                  </Button>
                                )}

                                {app.status !== 'rejected' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateAdoptionStatus(app.id, 'rejected')}
                                    className="h-8 text-xs text-destructive hover:bg-destructive/10"
                                  >
                                    <X className="h-3.5 w-3.5 mr-1" /> Reject
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 5: REPORTS & COMMUNICATIONS */}
            {/* ============================================================== */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                
                {/* Sub-tab selection */}
                <div className="flex gap-2 border-b border-border pb-3">
                  <Button
                    variant={reportSubTab === 'rescues' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReportSubTab('rescues')}
                    className="rounded-xl text-xs gap-1.5"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" /> Emergency Rescues ({rescuesList.length})
                  </Button>
                  <Button
                    variant={reportSubTab === 'contacts' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReportSubTab('contacts')}
                    className="rounded-xl text-xs gap-1.5"
                  >
                    <Mail className="h-3.5 w-3.5" /> Contact Inquiries ({contactsList.length})
                  </Button>
                </div>

                {reportSubTab === 'rescues' ? (
                  <Card className="bg-card border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/60 text-muted-foreground uppercase text-xs font-semibold">
                          <tr>
                            <th className="px-5 py-3.5">Urgency</th>
                            <th className="px-5 py-3.5">Location</th>
                            <th className="px-5 py-3.5">Reporter Details</th>
                            <th className="px-5 py-3.5">Description</th>
                            <th className="px-5 py-3.5">Status</th>
                            <th className="px-5 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {rescuesLoading ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-muted-foreground">Loading emergency dispatches...</td>
                            </tr>
                          ) : rescuesList.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                No emergency rescue dispatches logged.
                              </td>
                            </tr>
                          ) : (
                            rescuesList.map(r => (
                              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-5 py-3.5">
                                  <Badge
                                    variant={r.urgency === 'critical' || r.urgency === 'high' ? 'destructive' : 'secondary'}
                                    className="uppercase text-[10px] font-bold tracking-wider"
                                  >
                                    {r.urgency}
                                  </Badge>
                                </td>

                                <td className="px-5 py-3.5 text-xs text-foreground font-medium">
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span>{r.location}</span>
                                  </div>
                                </td>

                                <td className="px-5 py-3.5 text-xs">
                                  <p className="font-semibold text-foreground">{r.reporterName}</p>
                                  <p className="text-muted-foreground">{r.reporterPhone}</p>
                                </td>

                                <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-xs truncate">
                                  {r.description}
                                </td>

                                <td className="px-5 py-3.5">
                                  <select
                                    value={r.status}
                                    onChange={(e) => handleUpdateRescueStatus(r.id, e.target.value as any)}
                                    className="text-xs px-2.5 py-1 rounded-lg border border-border bg-card capitalize"
                                  >
                                    <option value="reported">Reported</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                  </select>
                                </td>

                                <td className="px-5 py-3.5 text-right">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteRescue(r.id)}
                                    className="h-8 text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ) : (
                  <Card className="bg-card border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/60 text-muted-foreground uppercase text-xs font-semibold">
                          <tr>
                            <th className="px-5 py-3.5">Sender</th>
                            <th className="px-5 py-3.5">Subject</th>
                            <th className="px-5 py-3.5">Message Snippet</th>
                            <th className="px-5 py-3.5">Date</th>
                            <th className="px-5 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {contactsLoading ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-muted-foreground">Loading contact inquiries...</td>
                            </tr>
                          ) : contactsList.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                No contact form inquiries received yet.
                              </td>
                            </tr>
                          ) : (
                            contactsList.map(c => (
                              <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-5 py-3.5">
                                  <p className="font-semibold text-foreground text-sm">{c.name}</p>
                                  <p className="text-xs text-muted-foreground">{c.email}</p>
                                </td>

                                <td className="px-5 py-3.5 text-xs font-medium text-foreground">
                                  {c.subject}
                                </td>

                                <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-sm truncate">
                                  {c.message}
                                </td>

                                <td className="px-5 py-3.5 text-xs text-muted-foreground">
                                  {formatDate(c.createdAt)}
                                </td>

                                <td className="px-5 py-3.5 text-right space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setViewingContact(c)}
                                    className="h-8 text-xs"
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteContact(c.id)}
                                    className="h-8 text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 6: ANALYTICS */}
            {/* ============================================================== */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                
                {/* 3 Overview Stat Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="bg-card border-border rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground">Adoption Approval Rate</p>
                    <h3 className="text-3xl font-serif font-bold text-foreground mt-2">
                      {adoptionsList.length > 0 
                        ? `${Math.round((adoptionsList.filter(a => a.status === 'approved').length / adoptionsList.length) * 100)}%`
                        : '0%'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">Based on {adoptionsList.length} total applications</p>
                  </Card>

                  <Card className="bg-card border-border rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground">Directory Availability Rate</p>
                    <h3 className="text-3xl font-serif font-bold text-foreground mt-2">
                      {petsList.length > 0 
                        ? `${Math.round((availablePetsCount / petsList.length) * 100)}%`
                        : '0%'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{availablePetsCount} pets ready for adoption</p>
                  </Card>

                  <Card className="bg-card border-border rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground">Emergency Dispatch Resolution</p>
                    <h3 className="text-3xl font-serif font-bold text-foreground mt-2">
                      {rescuesList.length > 0 
                        ? `${Math.round((rescuesList.filter(r => r.status === 'resolved').length / rescuesList.length) * 100)}%`
                        : '0%'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{rescuesList.filter(r => r.status === 'resolved').length} of {rescuesList.length} cases resolved</p>
                  </Card>
                </div>

                {/* Shelter Inventory Breakdown */}
                <Card className="bg-card border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-serif font-bold text-foreground mb-4">Partner Shelter Hosted Distribution</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Paws & Love Shelter', city: 'San Francisco' },
                      { name: 'Happy Tails Rescue', city: 'Los Angeles' },
                      { name: 'City Animal Services', city: 'New York' },
                    ].map(shelter => {
                      const count = petsList.filter(p => p.shelterName?.includes(shelter.name.split(' ')[0])).length;
                      const percent = Math.round((count / (petsList.length || 1)) * 100);

                      return (
                        <div key={shelter.name} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-foreground">{shelter.name} ({shelter.city})</span>
                            <span className="text-muted-foreground">{count} pets ({percent}%)</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 7: SETTINGS & SYSTEM HEALTH */}
            {/* ============================================================== */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                
                {/* System Diagnostics */}
                <Card className="bg-card border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-serif font-bold text-foreground">Backend & Database Diagnostics</h3>
                      <p className="text-xs text-muted-foreground">Real-time status of PawConnect microservices.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchHealth()}
                      className="rounded-xl text-xs gap-1.5"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${healthFetching ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                      <p className="text-muted-foreground font-medium">API Service Status</p>
                      <p className="text-base font-bold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> {healthData?.status || 'Active (Healthy)'}
                      </p>
                      <p className="text-muted-foreground">Service: {healthData?.service || 'PawConnect API'}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                      <p className="text-muted-foreground font-medium">Database Persistence Engine</p>
                      <p className="text-base font-bold text-foreground">Atomic Persistent JSON Store</p>
                      <p className="text-muted-foreground">PostgreSQL / Supabase Schema ready</p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                      <p className="text-muted-foreground font-medium">Authentication Protocol</p>
                      <p className="text-base font-bold text-foreground">JWT Session Tokens + HttpOnly Cookies</p>
                      <p className="text-muted-foreground">Role-based Access Control (RBAC) active</p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                      <p className="text-muted-foreground font-medium">Current Administrator</p>
                      <p className="text-base font-bold text-foreground">{user.fullName}</p>
                      <p className="text-muted-foreground">{user.email} (ID #{user.id})</p>
                    </div>
                  </div>
                </Card>

              </div>
            )}

          </main>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL: ADD NEW PET */}
      {/* ============================================================== */}
      <Dialog open={isAddPetOpen} onOpenChange={setIsAddPetOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif font-bold">Add New Pet Listing</DialogTitle>
            <DialogDescription className="text-xs">
              Enter complete pet details to publish a new profile in the adoption hub.
            </DialogDescription>
          </DialogHeader>

          {petFormError && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{petFormError}</span>
            </div>
          )}

          <form onSubmit={handleCreatePet} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-foreground mb-1 block">Pet Name *</label>
                <Input
                  required
                  placeholder="e.g. Copper"
                  value={petFormData.name}
                  onChange={(e) => setPetFormData({ ...petFormData, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-foreground mb-1 block">Species Type *</label>
                <select
                  value={petFormData.type}
                  onChange={(e) => setPetFormData({ ...petFormData, type: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-input bg-card text-xs"
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
                <label className="font-semibold text-foreground mb-1 block">Breed *</label>
                <Input
                  required
                  placeholder="e.g. Golden Retriever"
                  value={petFormData.breed}
                  onChange={(e) => setPetFormData({ ...petFormData, breed: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-foreground mb-1 block">Age *</label>
                <Input
                  required
                  placeholder="e.g. 2 years or 6 months"
                  value={petFormData.age}
                  onChange={(e) => setPetFormData({ ...petFormData, age: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-foreground mb-1 block">Gender *</label>
                <select
                  value={petFormData.gender}
                  onChange={(e) => setPetFormData({ ...petFormData, gender: e.target.value as any })}
                  className="w-full h-9 px-3 rounded-xl border border-input bg-card text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-foreground mb-1 block">Size *</label>
                <select
                  value={petFormData.size}
                  onChange={(e) => setPetFormData({ ...petFormData, size: e.target.value as any })}
                  className="w-full h-9 px-3 rounded-xl border border-input bg-card text-xs"
                >
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Extra Large">Extra Large</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-foreground mb-1 block">City / Metro *</label>
                <Input
                  required
                  placeholder="San Francisco"
                  value={petFormData.city}
                  onChange={(e) => setPetFormData({ ...petFormData, city: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-foreground mb-1 block">Shelter Name</label>
                <Input
                  placeholder="Paws & Love Shelter"
                  value={petFormData.shelterName}
                  onChange={(e) => setPetFormData({ ...petFormData, shelterName: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-foreground mb-1 block">Photo Image URL *</label>
                <Input
                  required
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={petFormData.imageUrl}
                  onChange={(e) => setPetFormData({ ...petFormData, imageUrl: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">Description & Backstory *</label>
              <textarea
                required
                rows={3}
                placeholder="Share personality, behavior, background, and adoption suitability..."
                value={petFormData.description}
                onChange={(e) => setPetFormData({ ...petFormData, description: e.target.value })}
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs"
              />
            </div>

            <div className="flex gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={petFormData.vaccinated}
                  onChange={(e) => setPetFormData({ ...petFormData, vaccinated: e.target.checked })}
                  className="rounded"
                />
                <span className="font-medium text-foreground">Vaccinated</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={petFormData.neutered}
                  onChange={(e) => setPetFormData({ ...petFormData, neutered: e.target.checked })}
                  className="rounded"
                />
                <span className="font-medium text-foreground">Neutered / Spayed</span>
              </label>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddPetOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl">
                Publish Pet Listing
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL: EDIT PET */}
      {/* ============================================================== */}
      <Dialog open={Boolean(editingPet)} onOpenChange={(open) => !open && setEditingPet(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif font-bold">Edit Pet Listing</DialogTitle>
            <DialogDescription className="text-xs">
              Update profile, status, or details for {editingPet?.name}.
            </DialogDescription>
          </DialogHeader>

          {editingPet && (
            <form onSubmit={handleUpdatePet} className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-foreground mb-1 block">Pet Name *</label>
                  <Input
                    required
                    value={editingPet.name}
                    onChange={(e) => setEditingPet({ ...editingPet, name: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground mb-1 block">Status</label>
                  <select
                    value={editingPet.status}
                    onChange={(e) => setEditingPet({ ...editingPet, status: e.target.value as any })}
                    className="w-full h-9 px-3 rounded-xl border border-input bg-card text-xs capitalize"
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="adopted">Adopted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-foreground mb-1 block">Breed</label>
                  <Input
                    value={editingPet.breed}
                    onChange={(e) => setEditingPet({ ...editingPet, breed: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground mb-1 block">Age</label>
                  <Input
                    value={editingPet.age}
                    onChange={(e) => setEditingPet({ ...editingPet, age: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-foreground mb-1 block">City</label>
                  <Input
                    value={editingPet.city}
                    onChange={(e) => setEditingPet({ ...editingPet, city: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground mb-1 block">Shelter Name</label>
                  <Input
                    value={editingPet.shelterName || ''}
                    onChange={(e) => setEditingPet({ ...editingPet, shelterName: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">Photo Image URL</label>
                <Input
                  value={editingPet.imageUrl}
                  onChange={(e) => setEditingPet({ ...editingPet, imageUrl: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">Description</label>
                <textarea
                  rows={3}
                  value={editingPet.description}
                  onChange={(e) => setEditingPet({ ...editingPet, description: e.target.value })}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs"
                />
              </div>

              <DialogFooter className="pt-3">
                <Button type="button" variant="outline" onClick={() => setEditingPet(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL: VIEW ADOPTION DOSSIER */}
      {/* ============================================================== */}
      <Dialog open={Boolean(viewingAdoption)} onOpenChange={(open) => !open && setViewingAdoption(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif font-bold">Adoption Applicant Dossier</DialogTitle>
            <DialogDescription className="text-xs">
              Complete application submission for {viewingAdoption?.pet?.name || `Pet #${viewingAdoption?.petId}`}.
            </DialogDescription>
          </DialogHeader>

          {viewingAdoption && (
            <div className="space-y-4 pt-2 text-xs">
              
              {/* Pet Info Banner */}
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{viewingAdoption.pet?.name || `Pet #${viewingAdoption.petId}`}</p>
                  <p className="text-muted-foreground">{viewingAdoption.pet?.breed} • {viewingAdoption.pet?.shelterName}</p>
                </div>
                <Badge className="capitalize text-xs">{viewingAdoption.status.replace('_', ' ')}</Badge>
              </div>

              {/* Applicant Details */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/40 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground block">Full Name:</span>
                  <span className="font-bold text-foreground text-sm">{viewingAdoption.fullName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Email Address:</span>
                  <span className="font-medium text-foreground">{viewingAdoption.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Phone:</span>
                  <span className="font-medium text-foreground">{viewingAdoption.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Occupation:</span>
                  <span className="font-medium text-foreground">{viewingAdoption.occupation || 'Not specified'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block">Home Address:</span>
                  <span className="font-medium text-foreground">{viewingAdoption.address}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Housing Type:</span>
                  <span className="font-medium text-foreground">{viewingAdoption.housingType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Pet Experience:</span>
                  <span className="font-medium text-foreground">{viewingAdoption.petExperience}</span>
                </div>
              </div>

              {/* Reason */}
              <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-1">
                <span className="text-muted-foreground font-semibold block">Lifestyle & Adoption Motivation:</span>
                <p className="text-foreground leading-relaxed italic">"{viewingAdoption.reason}"</p>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleUpdateAdoptionStatus(viewingAdoption.id, 'under_review')}
                  className="rounded-xl text-xs"
                >
                  Mark Under Review
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateAdoptionStatus(viewingAdoption.id, 'rejected')}
                  className="rounded-xl text-xs text-destructive hover:bg-destructive/10"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleUpdateAdoptionStatus(viewingAdoption.id, 'approved')}
                  className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Approve Application
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL: VIEW CONTACT INQUIRY */}
      {/* ============================================================== */}
      <Dialog open={Boolean(viewingContact)} onOpenChange={(open) => !open && setViewingContact(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif font-bold">Contact Inquiry</DialogTitle>
            <DialogDescription className="text-xs">
              Submitted on {viewingContact ? formatDate(viewingContact.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>

          {viewingContact && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1">
                <p className="font-semibold text-foreground text-sm">{viewingContact.name}</p>
                <p className="text-muted-foreground">{viewingContact.email}</p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-muted-foreground block">Subject:</span>
                <p className="font-bold text-foreground text-sm">{viewingContact.subject}</p>
              </div>

              <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-1">
                <span className="font-semibold text-muted-foreground block">Message Body:</span>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{viewingContact.message}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setViewingContact(null)} className="rounded-xl text-xs">
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteContact(viewingContact.id)}
                  className="rounded-xl text-xs"
                >
                  Delete Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* CONFIRMATION DIALOG */}
      {/* ============================================================== */}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => !open && setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif font-bold">{confirmDialog.title}</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed pt-1">
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.actionVariant || 'default'}
              onClick={confirmDialog.onConfirm}
              className="rounded-xl text-xs"
            >
              {confirmDialog.actionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default AdminDashboard;
