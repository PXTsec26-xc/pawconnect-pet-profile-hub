-- ==============================================================================
-- PAWCONNECT / PET PROFILE HUB - SUPABASE / POSTGRESQL DATABASE SCHEMA
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SHELTERS TABLE
CREATE TABLE IF NOT EXISTS shelters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    visit_timing VARCHAR(100) DEFAULT 'Daily 9am-6pm',
    description TEXT,
    image_url VARCHAR(500),
    pet_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PETS TABLE
CREATE TABLE IF NOT EXISTS pets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age VARCHAR(50) NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female')),
    size VARCHAR(50) NOT NULL CHECK (size IN ('Small', 'Medium', 'Large', 'Extra Large')),
    color VARCHAR(50),
    weight VARCHAR(50),
    vaccinated BOOLEAN DEFAULT true,
    neutered BOOLEAN DEFAULT true,
    description TEXT NOT NULL,
    personality VARCHAR(255),
    medical_history TEXT,
    image_url VARCHAR(500) NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    city VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'pending', 'adopted')),
    featured BOOLEAN DEFAULT false,
    shelter_id INTEGER REFERENCES shelters(id) ON DELETE SET NULL,
    shelter_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50) NOT NULL,
    count INTEGER DEFAULT 0
);

-- 5. ADOPTIONS TABLE
CREATE TABLE IF NOT EXISTS adoptions (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    occupation VARCHAR(255) NOT NULL,
    housing_type VARCHAR(100) NOT NULL,
    pet_experience VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. RESCUES / EMERGENCY REPORTS TABLE
CREATE TABLE IF NOT EXISTS rescues (
    id SERIAL PRIMARY KEY,
    reporter_name VARCHAR(255) NOT NULL,
    reporter_phone VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    urgency VARCHAR(50) NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    featured BOOLEAN DEFAULT false,
    read_time INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_pet_fav UNIQUE (user_id, pet_id)
);

-- 9. CONTACT INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR QUERY OPTIMIZATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_pets_type ON pets(type);
CREATE INDEX IF NOT EXISTS idx_pets_city ON pets(city);
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);
CREATE INDEX IF NOT EXISTS idx_pets_featured ON pets(featured);
CREATE INDEX IF NOT EXISTS idx_adoptions_user_id ON adoptions(user_id);
CREATE INDEX IF NOT EXISTS idx_adoptions_pet_id ON adoptions(pet_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescues ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Public can read pets, shelters, categories, blog_posts
CREATE POLICY "Public can view pets" ON pets FOR SELECT USING (true);
CREATE POLICY "Public can view shelters" ON shelters FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can view blog posts" ON blog_posts FOR SELECT USING (true);

-- Anyone can submit rescue reports and contact inquiries
CREATE POLICY "Anyone can report rescue" ON rescues FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit contact" ON contacts FOR INSERT WITH CHECK (true);

-- Users can view and manage their own adoptions and favorites
CREATE POLICY "Users can create adoptions" ON adoptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own adoptions" ON adoptions FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert favorites" ON favorites FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid()::text = user_id::text);
