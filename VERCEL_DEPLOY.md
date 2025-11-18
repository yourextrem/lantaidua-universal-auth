# Deploy ke Vercel untuk Testing Massal

## Step 1: Setup Environment Variables di Vercel

### Via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Login atau sign up

2. **Select Your Project**
   - Pilih project teman Anda
   - Atau create new project jika belum ada

3. **Go to Settings → Environment Variables**
   - Klik **Settings** tab
   - Klik **Environment Variables** di sidebar

4. **Add Environment Variables**

   Tambahkan semua variables ini:

   ```env
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dHJ1ZS1kdWNrbGluZy00OS5jbGVyay5hY2NvdW50cy5kZXYk
   
   # Auth Supabase (for Clerk user sync)
   NEXT_PUBLIC_AUTH_SUPABASE_URL=https://ymskibugdasknvcrtsld.supabase.co
   NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltc2tpYnVnZGFza252Y3J0c2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ2OTMsImV4cCI6MjA3ODk5MDY5M30.f5aLn6XsMdTXOrvksUEeF2RUmyGwstiwLdWn6K5VV4w
   
   # Learning Supabase (optional)
   NEXT_PUBLIC_SUPABASE_URL=https://ymskibugdasknvcrtsld.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltc2tpYnVnZGFza252Y3J0c2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ2OTMsImV4cCI6MjA3ODk5MDY5M30.f5aLn6XsMdTXOrvksUEeF2RUmyGwstiwLdWn6K5VV4w
   
   # Optional
   NEXT_PUBLIC_APP_ENV=production
   ```

5. **Set Environment for Each Variable**
   - ✅ **Production** (untuk production deployment)
   - ✅ **Preview** (untuk preview deployments)
   - ✅ **Development** (untuk local dev)

### Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add NEXT_PUBLIC_AUTH_SUPABASE_URL
vercel env add NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Step 2: Deploy ke Vercel

### Option 1: Via GitHub (Recommended)

1. **Push code ke GitHub**
   ```bash
   git add .
   git commit -m "Add Auth Supabase env variables"
   git push
   ```

2. **Connect GitHub ke Vercel**
   - Di Vercel Dashboard → **Add New Project**
   - Import dari GitHub repository
   - Vercel akan auto-detect Next.js

3. **Deploy**
   - Vercel akan auto-deploy dari GitHub
   - Environment variables akan otomatis digunakan

### Option 2: Via Vercel CLI

```bash
# Deploy
vercel

# Deploy to production
vercel --prod
```

## Step 3: Verify Deployment

### Check Environment Variables

Setelah deploy, verify env variables ter-load:

1. **Go to Vercel Dashboard → Your Project → Settings → Environment Variables**
2. **Check semua variables sudah ada**

### Test di Production

1. **Visit your Vercel URL** (misalnya: `https://your-project.vercel.app`)
2. **Open browser console** (F12)
3. **Run this check:**

```javascript
console.log('=== PRODUCTION ENV CHECK ===');
console.log('Clerk key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅' : '❌');
console.log('Auth Supabase URL:', process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL ? '✅' : '❌');
console.log('Auth Supabase Key:', process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY ? '✅' : '❌');
```

## Step 4: Testing Massal

### Checklist Sebelum Testing

- [ ] Environment variables sudah di-set di Vercel
- [ ] Code sudah menggunakan `NEXT_PUBLIC_AUTH_SUPABASE_URL`
- [ ] Deploy berhasil tanpa error
- [ ] Env variables ter-load (cek di console)
- [ ] Test login dengan 1 user dulu
- [ ] Verify user muncul di Supabase

### Testing Flow

1. **Share Vercel URL** ke teman-teman untuk testing
2. **Test dengan multiple users:**
   - Email sign-up
   - Google SSO sign-in
   - Microsoft SSO sign-in
   - GitHub SSO sign-in

3. **Monitor Supabase:**
   - Check `users` table di Supabase
   - Verify semua user tersync

4. **Monitor Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → **Logs**
   - Check untuk errors

## Troubleshooting

### Issue: Env Variables Not Loading

**Solution:**
1. Check di Vercel Dashboard → Settings → Environment Variables
2. Pastikan semua variables ada
3. Redeploy setelah menambah variables

### Issue: User Not Syncing in Production

**Solution:**
1. Check browser console untuk errors
2. Verify `NEXT_PUBLIC_AUTH_SUPABASE_URL` ter-load
3. Check Vercel logs untuk errors
4. Test manual sync di console:

```javascript
await authClient.connectClerkUserToSupabase('users');
```

### Issue: CORS Errors

**Solution:**
- Check Supabase CORS settings
- Add Vercel domain ke Supabase allowed origins

## Production Checklist

- [ ] Use production Clerk keys (`pk_live_...`)
- [ ] Use production Supabase URLs
- [ ] Enable auto-sync in code
- [ ] Test dengan multiple users
- [ ] Monitor Supabase for user sync
- [ ] Check Vercel logs regularly

## Quick Deploy Command

```bash
# One command deploy
vercel --prod
```

## Important Notes

1. **Never commit `.env.local`** - Use Vercel environment variables instead
2. **Use production keys** for production deployment
3. **Test thoroughly** before mass testing
4. **Monitor logs** during testing

