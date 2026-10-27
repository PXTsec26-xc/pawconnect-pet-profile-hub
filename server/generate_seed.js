import fs from 'fs';
import path from 'path';

// Read inspected api responses
const petsData = JSON.parse(fs.readFileSync('inspect_ref/api_responses/api_pets.json', 'utf-8')).pets;
const sheltersData = JSON.parse(fs.readFileSync('inspect_ref/api_responses/api_shelters.json', 'utf-8'));
const blogData = JSON.parse(fs.readFileSync('inspect_ref/api_responses/api_blog.json', 'utf-8')).posts;
const categoriesData = JSON.parse(fs.readFileSync('inspect_ref/api_responses/api_categories.json', 'utf-8'));

const code = `import bcrypt from 'bcryptjs';
import { db, User, Shelter, Pet, Category, BlogPost } from './db.js';

export async function runSeed() {
  console.log('Seeding database with authentic reference data...');

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  const initialUsers: User[] = [
    {
      id: 1,
      email: 'admin@pawconnect.org',
      password: adminHash,
      fullName: 'PawConnect Admin',
      phone: '(555) 000-0000',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      email: 'user@pawconnect.org',
      password: passwordHash,
      fullName: 'Demo Adopter',
      phone: '(555) 123-4567',
      role: 'user',
      createdAt: new Date().toISOString(),
    },
  ];

  const initialShelters: Shelter[] = ${JSON.stringify(sheltersData, null, 2)};

  const initialPets: Pet[] = ${JSON.stringify(petsData, null, 2)};

  const initialCategories: Category[] = ${JSON.stringify(categoriesData, null, 2)};

  const initialBlogPosts: BlogPost[] = ${JSON.stringify(blogData, null, 2)};

  db.seed({
    users: initialUsers,
    shelters: initialShelters,
    pets: initialPets,
    categories: initialCategories,
    blog_posts: initialBlogPosts,
  });

  console.log('Seeding completed successfully!');
  console.log('Admin account: admin@pawconnect.org / admin123');
  console.log('Demo user: user@pawconnect.org / password123');
}

// Auto-run when called directly
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeed().catch(console.error);
}
`;

fs.writeFileSync('server/seed.ts', code, 'utf-8');
console.log('Generated server/seed.ts successfully!');
