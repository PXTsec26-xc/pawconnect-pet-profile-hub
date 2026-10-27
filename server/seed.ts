import bcrypt from 'bcryptjs';
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

  const initialShelters: Shelter[] = [
  {
    "id": 3,
    "name": "City Animal Services",
    "address": "789 Pine Blvd",
    "city": "New York",
    "phone": "(212) 555-0303",
    "email": "info@cityanimals.gov",
    "website": "https://cityanimals.gov",
    "visitTiming": "Daily 8am-8pm",
    "description": "Official city animal shelter serving thousands of pets every year.",
    "imageUrl": "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600",
    "createdAt": "2026-06-26T06:34:28.208Z",
    "petCount": 4
  },
  {
    "id": 2,
    "name": "Happy Tails Rescue",
    "address": "456 Maple Ave",
    "city": "Los Angeles",
    "phone": "(323) 555-0202",
    "email": "adopt@happytails.org",
    "website": null,
    "visitTiming": "Tue-Sun 10am-5pm",
    "description": "Nonprofit rescue organization specializing in medium and large breed dogs and cats.",
    "imageUrl": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600",
    "createdAt": "2026-06-26T06:34:28.208Z",
    "petCount": 4
  },
  {
    "id": 1,
    "name": "Paws & Love Shelter",
    "address": "123 Oak Street",
    "city": "San Francisco",
    "phone": "(415) 555-0101",
    "email": "hello@pawsandlove.org",
    "website": "https://pawsandlove.org",
    "visitTiming": "Mon-Sat 9am-6pm",
    "description": "A family-run shelter dedicated to finding loving homes for abandoned pets since 2005.",
    "imageUrl": "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600",
    "createdAt": "2026-06-26T06:34:28.208Z",
    "petCount": 4
  }
];

  const initialPets: Pet[] = [
  {
    "id": 1,
    "name": "Buddy",
    "type": "Dog",
    "breed": "Golden Retriever",
    "age": "2 years",
    "gender": "Male",
    "size": "Large",
    "color": "Golden",
    "weight": "65 lbs",
    "vaccinated": true,
    "neutered": true,
    "description": "Buddy is an energetic and loving golden retriever who adores playtime and cuddles equally. He is great with kids and other dogs.",
    "personality": "Playful, Loyal, Gentle",
    "medicalHistory": "Up to date on all vaccines. Neutered. Healthy.",
    "imageUrl": "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600",
    "images": [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600",
      "https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=600"
    ],
    "city": "San Francisco",
    "status": "available",
    "featured": true,
    "shelterId": 1,
    "createdAt": "2026-06-26T06:34:28.214Z",
    "shelterName": "Paws & Love Shelter"
  },
  {
    "id": 2,
    "name": "Luna",
    "type": "Cat",
    "breed": "Persian",
    "age": "3 years",
    "gender": "Female",
    "size": "Small",
    "color": "White",
    "weight": "8 lbs",
    "vaccinated": true,
    "neutered": true,
    "description": "Luna is a serene and affectionate Persian cat who loves lounging in sunny spots and gentle head scratches.",
    "personality": "Calm, Affectionate, Independent",
    "medicalHistory": "Spayed. All vaccinations current. No known health issues.",
    "imageUrl": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600",
    "images": [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600",
      "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600"
    ],
    "city": "Los Angeles",
    "status": "available",
    "featured": true,
    "shelterId": 2,
    "createdAt": "2026-06-26T06:34:28.214Z",
    "shelterName": "Happy Tails Rescue"
  },
  {
    "id": 3,
    "name": "Max",
    "type": "Dog",
    "breed": "Labrador Mix",
    "age": "1 year",
    "gender": "Male",
    "size": "Medium",
    "color": "Black",
    "weight": "45 lbs",
    "vaccinated": true,
    "neutered": false,
    "description": "Max is a young and exuberant lab mix who is still learning his manners but has endless love to give.",
    "personality": "Energetic, Curious, Friendly",
    "medicalHistory": "Vaccinated. Heartworm negative.",
    "imageUrl": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600",
    "images": [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600"
    ],
    "city": "New York",
    "status": "available",
    "featured": true,
    "shelterId": 3,
    "createdAt": "2026-06-26T06:34:28.214Z",
    "shelterName": "City Animal Services"
  },
  {
    "id": 4,
    "name": "Whiskers",
    "type": "Cat",
    "breed": "Tabby",
    "age": "5 years",
    "gender": "Female",
    "size": "Medium",
    "color": "Orange",
    "weight": "10 lbs",
    "vaccinated": true,
    "neutered": true,
    "description": "Whiskers is a seasoned tabby who prefers a quiet home where she can be the queen she knows she is.",
    "personality": "Regal, Quiet, Loving on her terms",
    "medicalHistory": "Spayed. Dental cleaning done. Healthy.",
    "imageUrl": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600",
    "images": [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600"
    ],
    "city": "San Francisco",
    "status": "available",
    "featured": false,
    "shelterId": 1,
    "createdAt": "2026-06-26T06:34:28.214Z",
    "shelterName": "Paws & Love Shelter"
  },
  {
    "id": 5,
    "name": "Coco",
    "type": "Bird",
    "breed": "Cockatiel",
    "age": "2 years",
    "gender": "Female",
    "size": "Small",
    "color": "Yellow",
    "weight": "3 oz",
    "vaccinated": true,
    "neutered": false,
    "description": "Coco is a delightful cockatiel who whistles cheerful tunes and enjoys sitting on shoulders.",
    "personality": "Sociable, Musical, Curious",
    "medicalHistory": "Avian vet checked. Healthy.",
    "imageUrl": "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=600",
    "images": [
      "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=600"
    ],
    "city": "Los Angeles",
    "status": "available",
    "featured": true,
    "shelterId": 2,
    "createdAt": "2026-06-26T06:34:28.214Z",
    "shelterName": "Happy Tails Rescue"
  },
  {
    "id": 6,
    "name": "Peanut",
    "type": "Rabbit",
    "breed": "Holland Lop",
    "age": "1 year",
    "gender": "Male",
    "size": "Small",
    "color": "Brown",
    "weight": "4 lbs",
    "vaccinated": true,
    "neutered": true,
    "description": "Peanut is a floppy-eared Holland Lop who binkies around his enclosure with pure joy. Perfectly litter trained.",
    "personality": "Energetic, Gentle, Curious",
    "medicalHistory": "Neutered. Rabbit-savvy vet approved.",
    "imageUrl": "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600",
    "images": [
      "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600"
    ],
    "city": "New York",
    "status": "available",
    "featured": false,
    "shelterId": 3,
    "createdAt": "2026-06-26T06:34:28.214Z",
    "shelterName": "City Animal Services"
  },
  {
    "id": 7,
    "name": "Daisy",
    "type": "Dog",
    "breed": "Beagle",
    "age": "4 years",
    "gender": "Female",
    "size": "Medium",
    "color": "Tri-color",
    "weight": "25 lbs",
    "vaccinated": true,
    "neutered": true,
    "description": "Daisy is a sweet beagle who loves nose-led adventures and napping in warm laps afterward.",
    "personality": "Gentle, Curious, Vocal",
    "medicalHistory": "Spayed. All shots current.",
    "imageUrl": "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600",
    "images": [
      "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600"
    ],
    "city": "San Francisco",
    "status": "available",
    "featured": true,
    "shelterId": 1,
    "createdAt": "2026-06-26T06:34:28.214Z",
    "shelterName": "Paws & Love Shelter"
  },
  {
    "id": 8,
    "name": "Mochi",
    "type": "Cat",
    "breed": "Scottish Fold",
    "age": "2 years",
    "gender": "Male",
    "size": "Small",
    "color": "Gray",
    "weight": "9 lbs",
    "vaccinated": true,
    "neutered": true,
    "description": "Mochi has the most expressive owl-like eyes and is a total lap cat once he warms up to you.",
    "personality": "Reserved, Loving, Playful",
    "medicalHistory": "Neutered. Health checked.",
    "imageUrl": "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=600",
    "images": [
      "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=600"
    ],
    "city": "Los Angeles",
    "status": "available",
    "featured": false,
    "shelterId": 2,
    "createdAt": "2026-06-26T06:34:28.214Z",
    "shelterName": "Happy Tails Rescue"
  },
  {
    "id": 9,
    "name": "Rocky",
    "type": "Dog",
    "breed": "German Shepherd",
    "age": "3 years",
    "gender": "Male",
    "size": "Large",
    "color": "Black and Tan",
    "weight": "75 lbs",
    "vaccinated": true,
    "neutered": false,
    "description": "Rocky is a trained and loyal German Shepherd looking for an active family who loves outdoor adventures.",
    "personality": "Loyal, Intelligent, Protective",
    "medicalHistory": "Obedience trained. All vaccinations current.",
    "imageUrl": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600",
    "images": [
      "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600"
    ],
    "city": "New York",
    "status": "available",
    "featured": false,
    "shelterId": 3,
    "createdAt": "2026-06-26T06:34:28.214Z",
    "shelterName": "City Animal Services"
  },
  {
    "id": 10,
    "name": "Bella",
    "type": "Dog",
    "breed": "Poodle Mix",
    "age": "6 months",
    "gender": "Female",
    "size": "Small",
    "color": "Cream",
    "weight": "12 lbs",
    "vaccinated": true,
    "neutered": false,
    "description": "Bella is a fluffy poodle mix puppy who is still discovering the world — every day is an adventure.",
    "personality": "Playful, Sweet, Learning",
    "medicalHistory": "First round of vaccines done. Very healthy.",
    "imageUrl": "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600",
    "images": [
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600"
    ],
    "city": "San Francisco",
    "status": "available",
    "featured": true,
    "shelterId": 1,
    "createdAt": "2026-06-26T06:34:28.214Z",
    "shelterName": "Paws & Love Shelter"
  },
  {
    "id": 11,
    "name": "Oliver",
    "type": "Cat",
    "breed": "Maine Coon",
    "age": "4 years",
    "gender": "Male",
    "size": "Large",
    "color": "Brown Tabby",
    "weight": "15 lbs",
    "vaccinated": true,
    "neutered": true,
    "description": "Oliver is a magnificent Maine Coon with a mane like a lion and the gentle temperament of a teddy bear.",
    "personality": "Majestic, Gentle, Dog-like",
    "medicalHistory": "Neutered. Clean bill of health.",
    "imageUrl": "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600",
    "images": [
      "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600"
    ],
    "city": "Los Angeles",
    "status": "available",
    "featured": false,
    "shelterId": 2,
    "createdAt": "2026-06-26T06:34:28.214Z",
    "shelterName": "Happy Tails Rescue"
  },
  {
    "id": 12,
    "name": "Tweety",
    "type": "Bird",
    "breed": "Canary",
    "age": "1 year",
    "gender": "Male",
    "size": "Small",
    "color": "Yellow",
    "weight": "1 oz",
    "vaccinated": true,
    "neutered": false,
    "description": "Tweety fills any room with beautiful song. Perfect for someone who loves music and gentle companionship.",
    "personality": "Cheerful, Musical, Lively",
    "medicalHistory": "Health checked. Fully vaccinated.",
    "imageUrl": "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=600",
    "images": [
      "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=600"
    ],
    "city": "New York",
    "status": "available",
    "featured": false,
    "shelterId": 3,
    "createdAt": "2026-06-26T06:34:28.214Z",
    "shelterName": "City Animal Services"
  }
];

  const initialCategories: Category[] = [
  {
    "id": 1,
    "name": "Dogs",
    "icon": "dog",
    "count": 5
  },
  {
    "id": 2,
    "name": "Cats",
    "icon": "cat",
    "count": 4
  },
  {
    "id": 3,
    "name": "Birds",
    "icon": "bird",
    "count": 2
  },
  {
    "id": 4,
    "name": "Rabbits",
    "icon": "rabbit",
    "count": 1
  },
  {
    "id": 5,
    "name": "Others",
    "icon": "paw",
    "count": 0
  }
];

  const initialBlogPosts: BlogPost[] = [
  {
    "id": 1,
    "title": "10 Tips for First-Time Pet Adopters",
    "excerpt": "Bringing home a new pet is exciting and a little nerve-wracking. Here are our top tips to make the transition smooth for everyone.",
    "content": "Adopting a pet is one of the most rewarding decisions you can make. But preparation is key. First, pet-proof your home before your new companion arrives. Remove toxic plants, secure loose wires, and create a safe space just for them. Second, give them time to adjust — a new environment can be overwhelming. Patience and consistency will help them settle in. Third, schedule a vet appointment within the first week. Getting a health baseline is essential. Fourth, establish routines early — feeding, walks, and bedtime at the same times every day. Fifth, invest in proper training classes or resources. A well-trained pet is a happy pet.",
    "imageUrl": "https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=600",
    "category": "Adoption Tips",
    "authorName": "Dr. Sarah Chen",
    "featured": true,
    "readTime": 5,
    "createdAt": "2026-06-26T06:34:32.894Z"
  },
  {
    "id": 2,
    "title": "The Health Benefits of Owning a Pet",
    "excerpt": "Science confirms what pet owners have always known — our furry companions are good for our health.",
    "content": "Numerous studies have shown that pet ownership is linked to lower blood pressure, reduced stress hormones, and even longer life expectancy. Dogs especially encourage their owners to be more physically active with daily walks. Cats have been shown to reduce the risk of heart attack through their calming presence. The emotional benefits are equally profound — pets provide unconditional love and combat loneliness and depression. For children, growing up with pets teaches empathy, responsibility, and compassion. The bond between human and animal is truly one of nature's great gifts.",
    "imageUrl": "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600",
    "category": "Health",
    "authorName": "Dr. Michael Torres",
    "featured": true,
    "readTime": 7,
    "createdAt": "2026-06-26T06:34:32.894Z"
  },
  {
    "id": 3,
    "title": "How to Train Your New Dog: A Beginner's Guide",
    "excerpt": "Positive reinforcement is the gold standard in modern dog training. Learn the basics that every new dog owner should know.",
    "content": "The foundation of good dog training is positive reinforcement — rewarding the behavior you want to see more of. Start with basic commands: sit, stay, come, and leave it. Keep training sessions short (5-10 minutes) and always end on a positive note. Consistency is everything — use the same words and hand signals every time. Never punish your dog for mistakes. Instead, redirect them to the correct behavior and reward it. Socialization is equally important — expose your puppy to different people, animals, and environments during their critical period (3-14 weeks). Consider enrolling in a puppy class for guided training and socialization in one.",
    "imageUrl": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600",
    "category": "Training",
    "authorName": "Jamie Rodriguez",
    "featured": false,
    "readTime": 8,
    "createdAt": "2026-06-26T06:34:32.894Z"
  },
  {
    "id": 4,
    "title": "What to Feed Your Cat: Nutrition Basics",
    "excerpt": "Cats are obligate carnivores with specific dietary needs. Here is everything you need to know about feeding your feline.",
    "content": "Unlike dogs and humans, cats require specific nutrients found only in animal tissue. Taurine, arachidonic acid, and vitamin A must come from meat — cats cannot synthesize these themselves. High-quality commercial cat foods are formulated to meet these needs. When choosing food, look for a named protein source (chicken, salmon) as the first ingredient. Avoid foods with excessive fillers like corn syrup or artificial preservatives. Wet food provides essential hydration and closely mimics a cat's natural diet. Fresh water should always be available. Kittens, adults, and senior cats have different nutritional requirements — choose food appropriate for your cat's life stage.",
    "imageUrl": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600",
    "category": "Nutrition",
    "authorName": "Dr. Lisa Park",
    "featured": false,
    "readTime": 6,
    "createdAt": "2026-06-26T06:34:32.894Z"
  }
];

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
