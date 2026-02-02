# Deploying to Netlify

This app is configured for Netlify via `netlify.toml`. Two things commonly cause "works locally but not on Netlify":

## 1. Publish directory (handled by netlify.toml)

Quasar SPA builds to **`dist/spa`**, not `dist`. The repo includes a `netlify.toml` that sets:

- **Build command:** `npm run build`
- **Publish directory:** `dist/spa`
- **Node version:** 20

If you overrode these in the Netlify UI, remove overrides or set Publish directory to `dist/spa`.

## 2. Firebase authorized domains (required)

Firebase only allows requests from domains you explicitly allow. Your Netlify URL is **not** allowed by default.

**Do this after your first deploy:**

1. Open [Firebase Console](https://console.firebase.google.com/) → your project (**clixsys-smart-mirror**).
2. Go to **Project settings** (gear) → **Your apps**.
3. Under **Authorized domains**, click **Add domain**.
4. Add:
   - Your Netlify URL, e.g. `your-site-name.netlify.app`
   - Any custom domain you use (e.g. `checkin.yourhotel.com`).

Without this, Firestore and other Firebase APIs will fail on the deployed site (often with permission or network errors in the console), while everything works on localhost.

## Quick check

- **Blank or wrong page:** Publish directory was wrong → use `dist/spa`.
- **Page loads but kiosk/booking fails, console errors about Firebase:** Add your Netlify (and custom) domain in Firebase **Authorized domains**.
