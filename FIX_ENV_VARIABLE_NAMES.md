# Fix: Environment Variable Names Mismatch

## ❌ Error yang Terjadi

Console menunjukkan error:
```
Missing Supabase environment variables:
NEXT_PUBLIC_LANTAIDUA_UNIVERSAL_AUTH_SUPABASE_URL: X Missing
NEXT_PUBLIC_LANTAIDUA_UNIVERSAL_AUTH_SUPABASE_ANON_KEY: X Missing
```

## 🔍 Masalah

Kode teman Anda mencari env variable dengan nama:
- `NEXT_PUBLIC_LANTAIDUA_UNIVERSAL_AUTH_SUPABASE_URL`
- `NEXT_PUBLIC_LANTAIDUA_UNIVERSAL_AUTH_SUPABASE_ANON_KEY`

Tapi yang sudah di-set di Vercel:
- `NEXT_PUBLIC_AUTH_SUPABASE_URL`
- `NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY`

**Nama tidak match!**

## ✅ Solusi

### Option 1: Update Environment Variables di Vercel (Recommended)

Tambahkan env variables dengan nama yang dicari kode:

1. **Go to Vercel Dashboard**
2. **Settings → Environment Variables**
3. **Add these variables:**

```
NEXT_PUBLIC_LANTAIDUA_UNIVERSAL_AUTH_SUPABASE_URL=https://ymskibugdasknvcrtsld.supabase.co

NEXT_PUBLIC_LANTAIDUA_UNIVERSAL_AUTH_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltc2tpYnVnZGFza252Y3J0c2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ2OTMsImV4cCI6MjA3ODk5MDY5M30.f5aLn6XsMdTXOrvksUEeF2RUmyGwstiwLdWn6K5VV4w
```

4. **Set untuk:** Production, Preview, Development
5. **Redeploy** setelah menambah variables

### Option 2: Update Code (Alternative)

Jika teman Anda punya akses ke code, update untuk menggunakan nama yang sudah ada:

**Dari:**
```typescript
process.env.NEXT_PUBLIC_LANTAIDUA_UNIVERSAL_AUTH_SUPABASE_URL
process.env.NEXT_PUBLIC_LANTAIDUA_UNIVERSAL_AUTH_SUPABASE_ANON_KEY
```

**Ke:**
```typescript
process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL
process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY
```

## 📋 Complete Environment Variables untuk Vercel

Tambahkan SEMUA ini:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dHJ1ZS1kdWNrbGluZy00OS5jbGVyay5hY2NvdW50cy5kZXYk

# Auth Supabase (standard names)
NEXT_PUBLIC_AUTH_SUPABASE_URL=https://ymskibugdasknvcrtsld.supabase.co
NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltc2tpYnVnZGFza252Y3J0c2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ2OTMsImV4cCI6MjA3ODk5MDY5M30.f5aLn6XsMdTXOrvksUEeF2RUmyGwstiwLdWn6K5VV4w

# Auth Supabase (custom names - untuk kode teman Anda)
NEXT_PUBLIC_LANTAIDUA_UNIVERSAL_AUTH_SUPABASE_URL=https://ymskibugdasknvcrtsld.supabase.co
NEXT_PUBLIC_LANTAIDUA_UNIVERSAL_AUTH_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltc2tpYnVnZGFza252Y3J0c2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ2OTMsImV4cCI6MjA3ODk5MDY5M30.f5aLn6XsMdTXOrvksUEeF2RUmyGwstiwLdWn6K5VV4w

# Learning Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=https://ymskibugdasknvcrtsld.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltc2tpYnVnZGFza252Y3J0c2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ2OTMsImV4cCI6MjA3ODk5MDY5M30.f5aLn6XsMdTXOrvksUEeF2RUmyGwstiwLdWn6K5VV4w
```

## 🔄 Setelah Update

1. **Redeploy di Vercel** (penting!)
2. **Test lagi** - error harus hilang
3. **Check console** - tidak ada error lagi
4. **Test login** - data harus muncul di Supabase

## ✅ Quick Fix

**Cara tercepat:** Tambahkan 2 env variables baru di Vercel dengan nama yang dicari kode, lalu redeploy.

Nama yang perlu ditambahkan:
- `NEXT_PUBLIC_LANTAIDUA_UNIVERSAL_AUTH_SUPABASE_URL`
- `NEXT_PUBLIC_LANTAIDUA_UNIVERSAL_AUTH_SUPABASE_ANON_KEY`

Dengan value yang sama seperti `NEXT_PUBLIC_AUTH_SUPABASE_URL` dan `NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY`.

