# Where to Find Your Credentials

## 1. Clerk Publishable Key

### Steps to Get Clerk Publishable Key:

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com
   - Sign in to your account

2. **Select Your Application**
   - If you have multiple apps, select the one you want to use

3. **Go to API Keys**
   - Click on **"API Keys"** in the left sidebar
   - Or go to: **"Configure"** → **"API Keys"**

4. **Copy the Publishable Key**
   - You'll see two keys:
     - **Publishable key** (starts with `pk_test_` or `pk_live_`)
     - **Secret key** (starts with `sk_test_` or `sk_live_`)
   - **You only need the Publishable key** for client-side
   - It looks like: `pk_test_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`

5. **Copy it to `.env.local`**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```

## 2. Supabase Credentials

### Do You Need Private/Secret Key?

**No, you don't need the private/secret key for client-side use!**

- **anon/public key**: ✅ Use this in `.env.local` (safe for client-side)
- **service_role key**: ❌ Never use in client-side code (server-side only)

### Steps to Get Supabase Credentials:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in to your account

2. **Select Your Project**
   - Click on the project you want to use

3. **Go to Settings → API**
   - Click the **gear icon** (⚙️) in the left sidebar
   - Click on **"API"** in the settings menu

4. **Copy Your Credentials**
   - **Project URL**: 
     - Found under "Project URL"
     - Looks like: `https://abcdefghijklmnop.supabase.co`
   - **anon public key**:
     - Found under "Project API keys" → "anon public"
     - It's a long JWT token starting with `eyJ...`
     - This is the one you need for `.env.local`

5. **Copy to `.env.local`**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_long_token_here
   ```

### Important Notes:
- ✅ **anon/public key** is safe to use in client-side code
- ❌ **service_role key** is for server-side only (never expose it!)
- ✅ The anon key has Row Level Security (RLS) protection

## 3. NEXT_PUBLIC_APP_ENV

### What is it?

`NEXT_PUBLIC_APP_ENV` is **optional** and used to detect your environment (dev, staging, prod).

### Where to Set It?

You set it yourself in `.env.local`:

```env
# For development
NEXT_PUBLIC_APP_ENV=dev

# For staging
NEXT_PUBLIC_APP_ENV=staging

# For production
NEXT_PUBLIC_APP_ENV=prod
```

### How It Works:

The package uses this to detect your environment:
1. First checks `NEXT_PUBLIC_APP_ENV`
2. If not set, checks `NODE_ENV`
3. Defaults to `'dev'` if neither is set

### You Can Also Use NODE_ENV:

If you don't set `NEXT_PUBLIC_APP_ENV`, the package will use `NODE_ENV`:
- `NODE_ENV=development` → returns `'dev'`
- `NODE_ENV=production` → returns `'prod'`
- `NODE_ENV=staging` → returns `'staging'`

## Complete .env.local Example

```env
# Clerk Configuration
# Get from: https://dashboard.clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890

# Supabase Configuration
# Get from: https://supabase.com/dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDU3Mjk2MDAsImV4cCI6MTk2MTMwNTYwMH0.your_long_token_here

# Optional: Environment (you set this yourself)
NEXT_PUBLIC_APP_ENV=dev
```

## Quick Reference

| Credential | Where to Find | Required? |
|------------|---------------|-----------|
| Clerk Publishable Key | Clerk Dashboard → API Keys | ✅ Yes |
| Supabase URL | Supabase Dashboard → Settings → API | ✅ Yes |
| Supabase anon key | Supabase Dashboard → Settings → API | ✅ Yes |
| Supabase secret key | Supabase Dashboard → Settings → API | ❌ No (server-side only) |
| NEXT_PUBLIC_APP_ENV | You set it yourself | ❌ Optional |

## Security Notes

✅ **Safe to use in `.env.local` (client-side):**
- Clerk publishable key
- Supabase URL
- Supabase anon/public key
- NEXT_PUBLIC_APP_ENV

❌ **Never use in client-side (server-side only):**
- Clerk secret key
- Supabase service_role key
- Any database passwords

## Troubleshooting

### "Invalid Clerk key"
- ✅ Make sure you copied the **publishable** key (starts with `pk_`)
- ✅ Check for extra spaces or line breaks
- ✅ Verify the key is from the correct Clerk application

### "Invalid Supabase URL"
- ✅ Make sure it starts with `https://`
- ✅ Check that it ends with `.supabase.co`
- ✅ No trailing slashes

### "Invalid Supabase key"
- ✅ Make sure you're using the **anon/public** key (not service_role)
- ✅ The key should be a long JWT token
- ✅ Check for extra spaces

