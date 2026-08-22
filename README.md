# Amino Studio — checkout site

A password-protected shop + checkout page built with Next.js, ready to deploy on Vercel.
Pastel pink/yellow theme. Customers browse items, add quantities, go to checkout, see
the admin fee (₱200) + shipping fee added automatically based on location, fill in their
details, and upload a screenshot of payment — which gets uploaded straight into a Google
Drive folder you already own, along with all their order details.

## What's included
- `/login` — password screen (password lives in an environment variable, so you can change
  it any time without touching code)
- `/` — product catalog with quantity steppers, pulled from `lib/products.js`
- `/checkout` — cart summary "receipt", customer form, screenshot upload
- `app/api/checkout/route.js` — uploads the screenshot to your Google Drive folder and
  writes all the order info (name, email, address, Telegram, contact, items, fees, total)
  into that file's description

## 1. Get the code onto GitHub (once)
1. Unzip this project.
2. Create a new empty repo on GitHub.
3. From inside the project folder:
   ```
   git init
   git add .
   git commit -m "Amino Studio checkout"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

## 2. Set up Google Drive uploads (one-time)
1. Go to https://console.cloud.google.com and create a project (or use an existing one).
2. Enable the **Google Drive API** for that project (APIs & Services → Enable APIs → search "Google Drive API").
3. Go to **APIs & Services → Credentials → Create Credentials → Service Account**. Give it any name.
4. Open the new service account → **Keys** tab → **Add key → Create new key → JSON**. This downloads a `.json` file — keep it safe, don't commit it to GitHub.
5. In that JSON file you'll need two values: `client_email` and `private_key`.
6. In Google Drive, open (or create) the folder where you want screenshots to land. Click **Share**, and share it with the `client_email` from step 5, giving it **Editor** access.
7. Copy the folder's ID from its URL — the part after `/folders/`, e.g.
   `https://drive.google.com/drive/folders/1AbCдефXYZ...` → the ID is `1AbCдефXYZ...`.

## 3. Deploy to Vercel
1. Go to https://vercel.com → **Add New → Project** → import the GitHub repo you pushed.
2. Before deploying, open **Environment Variables** and add:
   | Name | Value |
   |---|---|
   | `SITE_PASSWORD` | whatever password you want customers to use |
   | `COOKIE_SECRET` | any random string |
   | `GOOGLE_CLIENT_EMAIL` | the `client_email` from your service account JSON |
   | `GOOGLE_PRIVATE_KEY` | the `private_key` from your service account JSON (paste it as-is, including `-----BEGIN PRIVATE KEY-----`) |
   | `GOOGLE_DRIVE_FOLDER_ID` | the folder ID from step 2.7 |
3. Click **Deploy**. In a minute or two you'll get a live URL like `amino-studio.vercel.app`.

## Changing the password later
Go to your project on vercel.com → **Settings → Environment Variables** → edit `SITE_PASSWORD`
→ save. Then go to the **Deployments** tab and click **Redeploy** on the latest deployment
(takes about 30 seconds). No code changes needed.

## Editing products
Open `lib/products.js`. Each item needs an `id`, `name`, `price` (in pesos), `description`,
and optionally an `image` URL. Push the change to GitHub and Vercel redeploys automatically.

## Editing the admin fee or shipping rates
Open `lib/shipping.js` — `ADMIN_FEE` is the flat fee, `SHIPPING_RATES` is the list customers
pick from at checkout. Add, remove, or reprice locations there.

## Running it locally to preview changes
```
npm install
cp .env.example .env.local   # then fill in your own values
npm run dev
```
Visit http://localhost:3000 — it'll ask for the password from `.env.local`.

## Notes
- The password gate uses a simple cookie, good enough for keeping casual visitors out —
  it isn't bank-grade security, so don't use it to protect anything more sensitive than
  "don't let randoms browse my shop."
- Every submitted order becomes one file in your Drive folder (the payment screenshot),
  with the customer's full order details saved in that file's "Description" field —
  open the file in Drive and check the details panel to read them.
