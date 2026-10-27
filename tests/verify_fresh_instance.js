import { db } from '../dist/server/db.js';

console.log('--- Database Persistence Verification After Fresh Instance ---');
console.log('Pets count:', db.getPets().length);
console.log('Users count:', db.getUsers().length);
console.log('Adoptions count:', db.getAdoptions().length);
console.log('Rescue reports count:', db.getRescueReports().length);
console.log('Favorites count (user 3):', db.getFavorites(3).length);

const admin = db.getUserByEmail('admin@pawconnect.org');
console.log('Admin account found:', Boolean(admin), 'Role:', admin?.role);

const demoUser = db.getUserByEmail('user@pawconnect.org');
console.log('Demo user account found:', Boolean(demoUser), 'Role:', demoUser?.role);

const newPet = db.getPets().find(p => p.name.startsWith('Rocky'));
console.log('Persisted pet created in previous session found:', Boolean(newPet), 'ID:', newPet?.id);
