# Quick Guide: Deploy ke Vercel untuk Testing Massal

## 🚀 Langkah Cepat (5 Menit)

### 1. Setup Environment Variables di Vercel

1. Buka: https://vercel.com/dashboard
2. Pilih project → **Settings** → **Environment Variables**
3. Tambahkan variables ini (copy-paste):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dHJ1ZS1kdWNrbGluZy00OS5jbGVyay5hY2NvdW50cy5kZXYk

NEXT_PUBLIC_AUTH_SUPABASE_URL=https://ymskibugdasknvcrtsld.supabase.co

NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltc2tpYnVnZGFza252Y3J0c2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ2OTMsImV4cCI6MjA3ODk5MDY5M30.f5aLn6XsMdTXOrvksUEeF2RUmyGwstiwLdWn6K5VV4w

NEXT_PUBLIC_SUPABASE_URL=https://ymskibugdasknvcrtsld.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltc2tpYnVnZGFza252Y3J0c2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ2OTMsImV4cCI6MjA3ODk5MDY5M30.f5aLn6XsMdTXOrvksUEeF2RUmyGwstiwLdWn6K5VV4w
```

4. Set untuk: ✅ Production, ✅ Preview, ✅ Development

### 2. Pastikan Code Menggunakan Auth Supabase

Di project Anda, pastikan menggunakan:

```typescript
// ✅ Gunakan AUTH_SUPABASE untuk user sync
authClient.createSupabaseClient(
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!
);
```

### 3. Deploy

**Via GitHub:**
- Push code ke GitHub
- Vercel akan auto-deploy

**Via CLI:**
```bash
vercel --prod
```

### 4. Test

1. Buka URL Vercel
2. Test login dengan 1 user
3. Cek Supabase - user harus muncul
4. Jika OK, share URL untuk testing massal

## ✅ Checklist

- [ ] Environment variables sudah di-set di Vercel
- [ ] Code menggunakan `NEXT_PUBLIC_AUTH_SUPABASE_URL`
- [ ] Deploy berhasil
- [ ] Test dengan 1 user dulu
- [ ] User muncul di Supabase
- [ ] Ready untuk testing massal!

## 🐛 Troubleshooting

**User tidak muncul di Supabase?**
- Cek browser console untuk errors
- Verify env variables ter-load
- Cek Vercel logs

**Env variables tidak ter-load?**
- Pastikan sudah di-set di Vercel
- Redeploy setelah menambah variables

## 📞 Support

Jika ada masalah, cek:
- Browser console (F12)
- Vercel logs (Dashboard → Logs)
- Supabase table (users table)

---

**Note:** Panduan lengkap ada di `VERCEL_DEPLOY.md`

