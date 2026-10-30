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

  const adminEmail = process.env.ADMIN_INITIAL_EMAIL;
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
  const userEmail = process.env.USER_INITIAL_EMAIL;
  const userPassword = process.env.USER_INITIAL_PASSWORD;

  const initialUsers: User[] = [];

  if (adminEmail && adminPassword) {
    const adminHash = await bcrypt.hash(adminPassword, 10);
    initialUsers.push({
      id: 1,
      email: adminEmail,
      password: adminHash,
      fullName: 'PawConnect Admin',
      phone: '(555) 000-0000',
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
  }

  if (userEmail && userPassword) {
    const userHash = await bcrypt.hash(userPassword, 10);
    initialUsers.push({
      id: 2,
      email: userEmail,
      password: userHash,
      fullName: 'Demo Adopter',
      phone: '(555) 123-4567',
      role: 'user',
      createdAt: new Date().toISOString(),
    });
  }

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
  console.log(\`Admin account initialized: \${adminEmail}\`);
  console.log(\`Demo user initialized: \${userEmail}\`);
  console.log('Note: Initial passwords are set securely via ADMIN_INITIAL_PASSWORD & USER_INITIAL_PASSWORD environment variables.');
}

// Auto-run when called directly
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeed().catch(console.error);
}
`;

fs.writeFileSync('server/seed.ts', code, 'utf-8');
console.log('Generated server/seed.ts successfully!');
