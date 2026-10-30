import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from './db.js';
import { generateToken, getAuthUser, requireAuth, requireAdmin, AuthenticatedRequest } from './auth.js';

export const apiRouter = Router();

// ==============================================================================
// 1. HEALTH CHECK
// ==============================================================================
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'PawConnect API',
  });
});

// ==============================================================================
// 2. AUTHENTICATION & USERS
// ==============================================================================
const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

apiRouter.post('/users/register', async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);
    const existing = db.getUserByEmail(validated.email);
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);
    const user = db.createUser({
      email: validated.email,
      password: hashedPassword,
      fullName: validated.fullName,
      phone: validated.phone || null,
      role: 'user',
    });

    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password, ...safeUser } = user;
    return res.status(201).json({
      user: safeUser,
      token,
      message: 'Registration successful',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

apiRouter.post('/users/login', async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);
    const user = db.getUserByEmail(validated.email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(validated.password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended by an administrator.' });
    }

    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password, ...safeUser } = user;
    return res.json({
      user: safeUser,
      token,
      message: 'Logged in successfully',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    return res.status(500).json({ message: 'Internal server error during login' });
  }
});

apiRouter.post('/users/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

apiRouter.get('/users/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// Admin User Management
apiRouter.get('/users', requireAdmin, (req, res) => {
  const users = db.getUsers().map(({ password, ...safeUser }) => ({
    ...safeUser,
    status: safeUser.status || 'active',
  }));
  res.json({ users });
});

apiRouter.patch('/users/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const currentAdmin = (req as AuthenticatedRequest).user!;
  const targetUser = db.getUserById(id);
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Prevent self-demotion or self-suspension
  if (id === currentAdmin.id) {
    if (req.body.role && req.body.role !== 'admin') {
      return res.status(400).json({ message: 'You cannot remove your own administrator role' });
    }
    if (req.body.status && req.body.status === 'suspended') {
      return res.status(400).json({ message: 'You cannot suspend your own account' });
    }
  }

  const updated = db.updateUser(id, req.body);
  if (!updated) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { password, ...safeUser } = updated;
  res.json({ user: safeUser });
});

apiRouter.delete('/users/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const currentAdmin = (req as AuthenticatedRequest).user!;
  if (id === currentAdmin.id) {
    return res.status(400).json({ message: 'You cannot delete your own administrator account' });
  }
  const success = db.deleteUser(id);
  if (!success) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ message: 'User deleted successfully' });
});

// ==============================================================================
// 3. PETS ENDPOINTS
// ==============================================================================
apiRouter.get('/pets', (req, res) => {
  const { type, size, gender, search, page = '1', limit = '50' } = req.query;
  const pets = db.getPets({
    type: type as string,
    size: size as string,
    gender: gender as string,
    search: search as string,
  });

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 50;
  const total = pets.length;
  const pages = Math.ceil(total / limitNum) || 1;
  const start = (pageNum - 1) * limitNum;
  const pagedPets = pets.slice(start, start + limitNum);

  res.json({
    pets: pagedPets,
    total,
    page: pageNum,
    pages,
  });
});

apiRouter.get('/pets/featured', (req, res) => {
  const featured = db.getFeaturedPets();
  res.json(featured);
});

apiRouter.get('/pets/stats', (req, res) => {
  const stats = db.getStats();
  res.json(stats);
});

apiRouter.get('/pets/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const pet = db.getPetById(id);
  if (!pet) {
    return res.status(404).json({ message: 'Pet not found' });
  }
  res.json(pet);
});

const petCreateSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  type: z.string().min(1, 'Pet type is required'),
  breed: z.string().min(1, 'Breed is required'),
  age: z.string().min(1, 'Age is required'),
  gender: z.enum(['Male', 'Female']),
  size: z.enum(['Small', 'Medium', 'Large', 'Extra Large']),
  color: z.string().optional(),
  weight: z.string().optional(),
  vaccinated: z.boolean().default(true),
  neutered: z.boolean().default(true),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  personality: z.string().optional(),
  medicalHistory: z.string().optional(),
  imageUrl: z.string().url('Valid image URL required'),
  city: z.string().min(1, 'City is required'),
  shelterId: z.number().optional().nullable(),
  shelterName: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(['available', 'pending', 'adopted']).default('available'),
});

apiRouter.post('/pets', requireAdmin, (req, res) => {
  try {
    const validated = petCreateSchema.parse(req.body);
    let shelterName = validated.shelterName;
    if (validated.shelterId && !shelterName) {
      const shelter = db.getShelterById(validated.shelterId);
      shelterName = shelter?.name || 'Local Rescue';
    }

    const created = db.createPet({
      name: validated.name,
      type: validated.type,
      breed: validated.breed,
      age: validated.age,
      gender: validated.gender,
      size: validated.size,
      color: validated.color || null,
      weight: validated.weight || null,
      vaccinated: validated.vaccinated,
      neutered: validated.neutered,
      description: validated.description,
      personality: validated.personality || null,
      medicalHistory: validated.medicalHistory || null,
      imageUrl: validated.imageUrl,
      images: [validated.imageUrl],
      city: validated.city,
      status: validated.status,
      featured: validated.featured,
      shelterId: validated.shelterId || null,
      shelterName: shelterName || 'PawConnect Shelter',
    });

    res.status(201).json(created);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to create pet listing' });
  }
});

apiRouter.patch('/pets/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const updated = db.updatePet(id, req.body);
  if (!updated) {
    return res.status(404).json({ message: 'Pet not found' });
  }
  res.json(updated);
});

apiRouter.delete('/pets/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const deleted = db.deletePet(id);
  if (!deleted) {
    return res.status(404).json({ message: 'Pet not found' });
  }
  res.json({ message: 'Pet deleted successfully' });
});

// ==============================================================================
// 4. SHELTERS ENDPOINTS
// ==============================================================================
apiRouter.get('/shelters', (req, res) => {
  const shelters = db.getShelters();
  res.json(shelters);
});

apiRouter.get('/shelters/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const shelter = db.getShelterById(id);
  if (!shelter) {
    return res.status(404).json({ message: 'Shelter not found' });
  }
  res.json(shelter);
});

// ==============================================================================
// 5. CATEGORIES ENDPOINT
// ==============================================================================
apiRouter.get('/categories', (req, res) => {
  const categories = db.getCategories();
  res.json(categories);
});

// ==============================================================================
// 6. BLOG ENDPOINTS
// ==============================================================================
apiRouter.get('/blog', (req, res) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const result = db.getBlogPosts(page, limit);
  res.json(result);
});

apiRouter.get('/blog/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = db.getBlogPostById(id);
  if (!post) {
    return res.status(404).json({ message: 'Blog post not found' });
  }
  res.json(post);
});

// ==============================================================================
// 7. ADOPTIONS APPLICATION ENDPOINTS
// ==============================================================================
const adoptionSchema = z.object({
  petId: z.number().int().positive(),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone number is required'),
  address: z.string().min(5, 'Full address is required'),
  occupation: z.string().min(2, 'Occupation is required'),
  housingType: z.string().min(1, 'Please select your housing type'),
  petExperience: z.string().min(1, 'Please select your pet experience'),
  reason: z.string().min(10, 'Please tell us about your home and lifestyle (at least 10 characters)'),
  agreement: z.boolean().refine(val => val === true, 'You must agree to the terms'),
});

apiRouter.get('/adoptions', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    // If not authenticated, return public sample adoptions or require auth
    return res.json(db.getAdoptions().slice(0, 5));
  }
  if (user.role === 'admin') {
    return res.json(db.getAdoptions());
  }
  return res.json(db.getAdoptions(user.id));
});

apiRouter.post('/adoptions', (req, res) => {
  try {
    const validated = adoptionSchema.parse(req.body);
    const pet = db.getPetById(validated.petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const user = getAuthUser(req);
    const created = db.createAdoption({
      petId: validated.petId,
      userId: user?.id || null,
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone,
      address: validated.address,
      occupation: validated.occupation,
      housingType: validated.housingType,
      petExperience: validated.petExperience,
      reason: validated.reason,
      status: 'pending',
    });

    res.status(201).json({
      application: created,
      message: 'Adoption application submitted successfully!',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to submit adoption application' });
  }
});

apiRouter.patch('/adoptions/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!['pending', 'under_review', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const updated = db.updateAdoptionStatus(id, status);
  if (!updated) {
    return res.status(404).json({ message: 'Adoption application not found' });
  }
  res.json(updated);
});

// ==============================================================================
// 8. EMERGENCY RESCUE REPORTS
// ==============================================================================
const rescueSchema = z.object({
  reporterName: z.string().min(2, 'Name is required'),
  reporterPhone: z.string().min(7, 'Phone number is required'),
  location: z.string().min(3, 'Precise location is required'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageUrl: z.string().optional().or(z.literal('')),
});

apiRouter.get('/rescue', (req, res) => {
  const reports = db.getRescueReports();
  res.json(reports);
});

apiRouter.post('/rescue', (req, res) => {
  try {
    const validated = rescueSchema.parse(req.body);
    const report = db.createRescueReport({
      reporterName: validated.reporterName,
      reporterPhone: validated.reporterPhone,
      location: validated.location,
      urgency: validated.urgency,
      description: validated.description,
      imageUrl: validated.imageUrl || null,
      status: 'reported',
    });

    res.status(201).json({
      report,
      message: 'Rescue report submitted. Dispatch team has been notified.',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to submit rescue report' });
  }
});

apiRouter.patch('/rescue/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!['reported', 'in_progress', 'resolved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const updated = db.updateRescueReportStatus(id, status);
  if (!updated) {
    return res.status(404).json({ message: 'Rescue report not found' });
  }
  res.json({ report: updated });
});

apiRouter.delete('/rescue/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const success = db.deleteRescueReport(id);
  if (!success) {
    return res.status(404).json({ message: 'Rescue report not found' });
  }
  res.json({ message: 'Rescue report deleted successfully' });
});

// ==============================================================================
// 9. FAVORITES ENDPOINTS
// ==============================================================================
apiRouter.get('/favorites', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Authentication required for favorites' });
  }
  const favs = db.getFavorites(user.id);
  res.json(favs);
});

apiRouter.post('/favorites', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  const { petId } = req.body;
  if (!petId || typeof petId !== 'number') {
    return res.status(400).json({ message: 'Valid petId is required' });
  }

  const favorite = db.addFavorite(user.id, petId);
  res.status(201).json(favorite);
});

apiRouter.delete('/favorites/:petId', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  const petId = parseInt(req.params.petId, 10);
  const success = db.removeFavorite(user.id, petId);
  res.json({ success, message: 'Removed from favorites' });
});

// ==============================================================================
// 10. CONTACT FORM ENDPOINT
// ==============================================================================
const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

apiRouter.post('/contact', (req, res) => {
  try {
    const validated = contactSchema.parse(req.body);
    const msg = db.createContact(validated);
    res.status(201).json({
      message: 'Thank you for reaching out! We will get back to you shortly.',
      id: msg.id,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to send message' });
  }
});

apiRouter.get('/contact', requireAdmin, (req, res) => {
  const messages = db.getContacts();
  res.json({ messages });
});

apiRouter.delete('/contact/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const success = db.deleteContact(id);
  if (!success) {
    return res.status(404).json({ message: 'Contact message not found' });
  }
  res.json({ message: 'Contact message deleted successfully' });
});
