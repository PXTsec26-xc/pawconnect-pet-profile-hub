import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export interface User {
  id: number;
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  role: 'user' | 'admin';
  status?: 'active' | 'suspended';
  createdAt: string;
}

export interface Shelter {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string | null;
  visitTiming?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  petCount?: number;
  createdAt: string;
}

export interface Pet {
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
  images: string[];
  city: string;
  status: 'available' | 'pending' | 'adopted';
  featured: boolean;
  shelterId?: number | null;
  shelterName?: string | null;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  count: number;
}

export interface Adoption {
  id: number;
  petId: number;
  userId?: number | null;
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
  pet?: Pet;
}

export interface RescueReport {
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

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  authorName: string;
  featured: boolean;
  readTime: number;
  createdAt: string;
}

export interface Favorite {
  id: number;
  userId: number;
  petId: number;
  createdAt: string;
  pet?: Pet;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  shelters: Shelter[];
  pets: Pet[];
  categories: Category[];
  adoptions: Adoption[];
  rescues: RescueReport[];
  blog_posts: BlogPost[];
  favorites: Favorite[];
  contacts: ContactMessage[];
}

// Persistent Storage Engine
const isVercel = Boolean(process.env.VERCEL);
const localDataFile = path.resolve(process.cwd(), 'pawconnect_data.json');
const vercelDataFile = path.resolve('/tmp', 'pawconnect_data.json');
const dataFilePath = isVercel ? vercelDataFile : localDataFile;

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (isVercel && !fs.existsSync(vercelDataFile) && fs.existsSync(localDataFile)) {
        try {
          fs.copyFileSync(localDataFile, vercelDataFile);
        } catch {}
      }

      if (fs.existsSync(dataFilePath)) {
        const raw = fs.readFileSync(dataFilePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading database file, initializing fresh store:', err);
    }
    const empty: DatabaseSchema = {
      users: [],
      shelters: [],
      pets: [],
      categories: [],
      adoptions: [],
      rescues: [],
      blog_posts: [],
      favorites: [],
      contacts: [],
    };
    this.saveData(empty);
    return empty;
  }

  private saveData(data: DatabaseSchema) {
    try {
      const tempPath = dataFilePath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, dataFilePath);
    } catch (err) {
      console.error('Error writing pawconnect_data.json:', err);
    }
  }

  private flush() {
    this.saveData(this.data);
  }

  // --- USERS ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: number): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const id = this.data.users.length ? Math.max(...this.data.users.map(u => u.id)) + 1 : 1;
    const newUser: User = {
      ...user,
      id,
      status: user.status || 'active',
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.flush();
    return newUser;
  }

  updateUser(id: number, updates: Partial<User>): User | undefined {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return undefined;
    const { password, id: _id, ...safeUpdates } = updates;
    Object.assign(user, safeUpdates);
    this.flush();
    return user;
  }

  deleteUser(id: number): boolean {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    this.flush();
    return true;
  }

  // --- SHELTERS ---
  getShelters(): Shelter[] {
    return this.data.shelters;
  }

  getShelterById(id: number): Shelter | undefined {
    return this.data.shelters.find(s => s.id === id);
  }

  // --- PETS ---
  getPets(filters?: { type?: string; size?: string; gender?: string; search?: string }): Pet[] {
    let list = this.data.pets;
    if (filters?.type && filters.type !== 'All' && filters.type !== 'All Types') {
      const typeLower = filters.type.toLowerCase();
      list = list.filter(p => 
        p.type.toLowerCase() === typeLower || 
        p.type.toLowerCase().startsWith(typeLower.replace(/s$/, ''))
      );
    }
    if (filters?.size && filters.size !== 'Any' && filters.size !== 'Any Size') {
      list = list.filter(p => p.size.toLowerCase() === filters.size!.toLowerCase());
    }
    if (filters?.gender && filters.gender !== 'Any') {
      list = list.filter(p => p.gender.toLowerCase() === filters.gender!.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.breed.toLowerCase().includes(q) || 
        p.city.toLowerCase().includes(q) ||
        (p.shelterName && p.shelterName.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getFeaturedPets(): Pet[] {
    return this.data.pets.filter(p => p.featured);
  }

  getPetById(id: number): Pet | undefined {
    return this.data.pets.find(p => p.id === id);
  }

  createPet(pet: Omit<Pet, 'id' | 'createdAt'>): Pet {
    const id = this.data.pets.length ? Math.max(...this.data.pets.map(p => p.id)) + 1 : 1;
    const newPet: Pet = {
      ...pet,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.pets.push(newPet);
    this.updateCategoryCounts();
    this.flush();
    return newPet;
  }

  updatePet(id: number, updates: Partial<Pet>): Pet | undefined {
    const pet = this.data.pets.find(p => p.id === id);
    if (!pet) return undefined;
    Object.assign(pet, updates);
    this.updateCategoryCounts();
    this.flush();
    return pet;
  }

  deletePet(id: number): boolean {
    const idx = this.data.pets.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.pets.splice(idx, 1);
    this.updateCategoryCounts();
    this.flush();
    return true;
  }

  // --- STATS ---
  getStats() {
    const availablePets = this.data.pets.filter(p => p.status === 'available').length;
    const petsAdopted = 1250 + this.data.adoptions.filter(a => a.status === 'approved').length;
    const sheltersCount = this.data.shelters.length || 18;
    const happyFamilies = 1100 + this.data.adoptions.filter(a => a.status === 'approved').length;
    return {
      petsAdopted,
      availablePets,
      sheltersCount,
      happyFamilies,
    };
  }

  // --- CATEGORIES ---
  getCategories(): Category[] {
    return this.data.categories;
  }

  private updateCategoryCounts() {
    for (const cat of this.data.categories) {
      const singular = cat.name.toLowerCase().replace(/s$/, '');
      cat.count = this.data.pets.filter(p => 
        p.status === 'available' && 
        (p.type.toLowerCase() === cat.name.toLowerCase() || p.type.toLowerCase().startsWith(singular))
      ).length;
    }
  }

  // --- ADOPTIONS ---
  getAdoptions(userId?: number): Adoption[] {
    let list = this.data.adoptions;
    if (userId) {
      list = list.filter(a => a.userId === userId);
    }
    return list.map(a => ({
      ...a,
      pet: this.data.pets.find(p => p.id === a.petId),
    }));
  }

  getAdoptionById(id: number): Adoption | undefined {
    const item = this.data.adoptions.find(a => a.id === id);
    if (!item) return undefined;
    return {
      ...item,
      pet: this.data.pets.find(p => p.id === item.petId),
    };
  }

  createAdoption(adoption: Omit<Adoption, 'id' | 'createdAt'>): Adoption {
    const id = this.data.adoptions.length ? Math.max(...this.data.adoptions.map(a => a.id)) + 1 : 1;
    const newAdoption: Adoption = {
      ...adoption,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.adoptions.push(newAdoption);
    this.flush();
    return {
      ...newAdoption,
      pet: this.data.pets.find(p => p.id === newAdoption.petId),
    };
  }

  updateAdoptionStatus(id: number, status: 'pending' | 'under_review' | 'approved' | 'rejected'): Adoption | undefined {
    const adoption = this.data.adoptions.find(a => a.id === id);
    if (!adoption) return undefined;
    adoption.status = status;
    if (status === 'approved') {
      const pet = this.data.pets.find(p => p.id === adoption.petId);
      if (pet) {
        pet.status = 'adopted';
      }
    }
    this.flush();
    return {
      ...adoption,
      pet: this.data.pets.find(p => p.id === adoption.petId),
    };
  }

  // --- RESCUE REPORTS ---
  getRescueReports(): RescueReport[] {
    return this.data.rescues;
  }

  createRescueReport(report: Omit<RescueReport, 'id' | 'createdAt'>): RescueReport {
    const id = this.data.rescues.length ? Math.max(...this.data.rescues.map(r => r.id)) + 1 : 1;
    const newReport: RescueReport = {
      ...report,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.rescues.push(newReport);
    this.flush();
    return newReport;
  }

  updateRescueReportStatus(id: number, status: 'reported' | 'in_progress' | 'resolved'): RescueReport | undefined {
    const report = this.data.rescues.find(r => r.id === id);
    if (!report) return undefined;
    report.status = status;
    this.flush();
    return report;
  }

  deleteRescueReport(id: number): boolean {
    const idx = this.data.rescues.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.data.rescues.splice(idx, 1);
    this.flush();
    return true;
  }

  // --- BLOG ---
  getBlogPosts(page = 1, limit = 10): { posts: BlogPost[]; total: number; page: number; pages: number } {
    const start = (page - 1) * limit;
    const posts = this.data.blog_posts.slice(start, start + limit);
    return {
      posts,
      total: this.data.blog_posts.length,
      page,
      pages: Math.ceil(this.data.blog_posts.length / limit) || 1,
    };
  }

  getBlogPostById(id: number): BlogPost | undefined {
    return this.data.blog_posts.find(p => p.id === id);
  }

  // --- FAVORITES ---
  getFavorites(userId: number): Favorite[] {
    const favs = this.data.favorites.filter(f => f.userId === userId);
    return favs.map(f => ({
      ...f,
      pet: this.data.pets.find(p => p.id === f.petId),
    }));
  }

  addFavorite(userId: number, petId: number): Favorite {
    const existing = this.data.favorites.find(f => f.userId === userId && f.petId === petId);
    if (existing) {
      return {
        ...existing,
        pet: this.data.pets.find(p => p.id === existing.petId),
      };
    }
    const id = this.data.favorites.length ? Math.max(...this.data.favorites.map(f => f.id)) + 1 : 1;
    const newFav: Favorite = {
      id,
      userId,
      petId,
      createdAt: new Date().toISOString(),
    };
    this.data.favorites.push(newFav);
    this.flush();
    return {
      ...newFav,
      pet: this.data.pets.find(p => p.id === newFav.petId),
    };
  }

  removeFavorite(userId: number, petId: number): boolean {
    const idx = this.data.favorites.findIndex(f => f.userId === userId && f.petId === petId);
    if (idx === -1) return false;
    this.data.favorites.splice(idx, 1);
    this.flush();
    return true;
  }

  // --- CONTACTS ---
  getContacts(): ContactMessage[] {
    return this.data.contacts;
  }

  createContact(message: Omit<ContactMessage, 'id' | 'createdAt'>): ContactMessage {
    const id = this.data.contacts.length ? Math.max(...this.data.contacts.map(c => c.id)) + 1 : 1;
    const newMsg: ContactMessage = {
      ...message,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.contacts.push(newMsg);
    this.flush();
    return newMsg;
  }

  deleteContact(id: number): boolean {
    const idx = this.data.contacts.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.contacts.splice(idx, 1);
    this.flush();
    return true;
  }

  // Seed method
  seed(initialData: Partial<DatabaseSchema>) {
    if (initialData.users && this.data.users.length === 0) this.data.users = initialData.users;
    if (initialData.shelters && this.data.shelters.length === 0) this.data.shelters = initialData.shelters;
    if (initialData.pets && this.data.pets.length === 0) this.data.pets = initialData.pets;
    if (initialData.categories && this.data.categories.length === 0) this.data.categories = initialData.categories;
    if (initialData.blog_posts && this.data.blog_posts.length === 0) this.data.blog_posts = initialData.blog_posts;
    this.updateCategoryCounts();
    this.flush();
  }
}

export const db = new DatabaseStore();
