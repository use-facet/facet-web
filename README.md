# Facet — Deployment Guide

Live in ~20 minutes. Follow these steps in order.

---

## 1. Get your Mailchimp credentials (5 min)

1. Log in to mailchimp.com (create a free account if you haven't)
2. Create an Audience: **Audience > Manage Audience > Add Audience**
   - Name it "Facet Waitlist"
3. Get your **Audience ID**:
   - Audience > Manage Audience > Settings > Audience name and defaults
   - Copy the "Audience ID" string (looks like `a1b2c3d4e5`)

4. Get your **API Key**:
   - Account > Profile > Extras > API keys > Create A Key
   - Copy the full key — it ends with a datacenter prefix like `-us21`
   - The part after the dash is your **server prefix** (e.g. `us21`)
   
5. Add a custom merge field for gender and priority (optional but useful):
   - Audience > Manage Audience > Settings > Audience fields and *|MERGE|* tags
   - Add field: Tag `GENDER`, Label "Gender", Type "Text"
   - Add field: Tag `PRIORITY`, Label "Priority", Type "Text"

---

## 2. Deploy to Vercel (10 min)

### Option A: Drag and drop (fastest)

1. Go to vercel.com, sign in with GitHub
2. Click **Add New > Project**
3. Choose **"Deploy from file upload"** (bottom of the import screen)
4. Drag the entire `facet-site` folder into the upload zone
5. Vercel auto-detects the `vercel.json` and sets up routes

### Option B: GitHub (recommended for ongoing updates)

1. Create a new private repo on github.com called `facet-site`
2. From your terminal inside the `facet-site` folder:
   ```
   git init
   git add .
   git commit -m "initial deploy"
   git remote add origin https://github.com/YOUR_USERNAME/facet-site.git
   git push -u origin main
   ```
3. Go to vercel.com > Add New > Project > Import from GitHub
4. Select `facet-site` > Deploy

---

## 3. Add environment variables in Vercel (2 min)

After deploying, go to:
**Project Settings > Environment Variables**

Add these three:

| Name | Value |
|------|-------|
| `MAILCHIMP_API_KEY` | Your full API key (e.g. `abc123def456...–us21`) |
| `MAILCHIMP_SERVER` | Just the datacenter part (e.g. `us21`) |
| `MAILCHIMP_LIST_ID` | Your audience ID (e.g. `a1b2c3d4e5`) |

Then go to **Deployments > Redeploy** so the new env vars take effect.

---

## 4. Connect your domain (3 min)

1. In Vercel: **Project Settings > Domains > Add Domain**
2. Type `usefacet.co`
3. Vercel gives you DNS records to add in GoDaddy
4. In GoDaddy: **DNS > Add Record**
   - Type: CNAME, Name: @, Value: cname.vercel-dns.com
   - Or follow the exact records Vercel shows you
5. DNS propagates in 10-60 minutes

---

## 5. Test the form

Once deployed, fill in the waitlist form on your live site and check:
- Mailchimp Audience > View Contacts — your email should appear
- The success state shows correctly

---

## File structure

```
facet-site/
  api/
    subscribe.js       ← Mailchimp serverless function
  public/
    index.html         ← Full website
    assets/
      facet-gem.svg
      facet-gem-light.svg
      grain.svg
  vercel.json          ← Routing config
  package.json
  README.md            ← This file
```

---

## Updating content

All site content is in `public/index.html`. Edit, commit, push — Vercel auto-deploys.

When you're ready to update pricing from $34.99 to $49.99 after the first 500 signups, search for `$34` in index.html and update the two lines.

---

## Support

reach.facet@gmail.com
