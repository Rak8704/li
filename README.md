# Livora - home decor store (Next.js, Vercel ready)

## Run on your computer
```
npm install
cp .env.example .env.local     # then edit the two passwords
npm run dev                    # http://localhost:3000   admin: /admin
```
Locally, data is saved in `data/store.json` and pictures in `data/uploads` (no database needed).

## Deploy on Vercel
1. Push this folder to a GitHub repository (`.env.local` and `data/` are git-ignored).
2. vercel.com -> Add New -> Project -> import the repository -> Deploy (do not change the build settings).
3. Project -> Storage (or Marketplace) -> Upstash Redis -> Create -> connect it to this project.
   Choose the Singapore region. Vercel adds `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_URL` / `KV_REST_API_TOKEN`) automatically.
4. Project -> Settings -> Environment Variables -> add `ADMIN_PASSWORD` and `AUTH_SECRET` (long random text) for Production.
5. Deployments -> Redeploy (so the new variables are used).
6. Open `https://your-site.vercel.app/admin`, sign in, set your bKash/Nagad/Rocket/Upay numbers and add products.

Product pictures are resized in the browser and stored in Redis, so no extra file storage is needed.

## Where things are
- Products and categories: `lib/products.js` (first-run sample data) and Admin -> Products
- Loyalty rules: `lib/loyalty.js`
- Customer account: `/account`, order tracking: `/track`
"# li" 
