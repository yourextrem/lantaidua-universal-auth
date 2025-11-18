-- ============================================
-- Supabase Database Setup for lantaidua-universal-auth
-- ============================================
-- This SQL script creates the necessary tables and indexes
-- for connecting Clerk users to Supabase database
-- ============================================

-- Create users table
-- This table stores user data synced from Clerk
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on clerk_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Create index on email for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;

-- Enable Row Level Security (RLS) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read their own data
-- This allows users to query their own records
CREATE POLICY "Users can read own data" ON users
  FOR SELECT 
  USING (true); -- For now, allow all reads. You can restrict this later.

-- Create policy: Allow inserts (for syncing Clerk users)
CREATE POLICY "Allow user inserts" ON users
  FOR INSERT
  WITH CHECK (true);

-- Create policy: Allow updates (for syncing Clerk users)
CREATE POLICY "Allow user updates" ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Optional: Create additional tables you might need
-- ============================================

-- Example: User profiles table (optional)
-- CREATE TABLE IF NOT EXISTS user_profiles (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--   clerk_id TEXT UNIQUE NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
--   bio TEXT,
--   phone TEXT,
--   address TEXT,
--   preferences JSONB,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- ============================================
-- Verification Queries (run these to verify setup)
-- ============================================

-- Check if table exists
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'users';

-- Check table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'users';

-- Check indexes
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'users';

