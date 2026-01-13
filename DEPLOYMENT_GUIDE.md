# Deployment Guide for Sims4StorylineVis

This guide will help you deploy your Sims 4 Storyline Visualization project to your custom domain.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Building the Project](#building-the-project)
3. [Deployment Options](#deployment-options)
4. [Domain Configuration](#domain-configuration)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- **Node.js** (>= 10.0) and **npm** installed
- A **custom domain** (purchased from a domain registrar)
- Access to your domain's DNS settings
- A **hosting account** (see deployment options below)

---

## Building the Project

### Step 1: Install Dependencies

First, navigate to your project directory and install all required dependencies:

```bash
cd Sims4StorylineVis
npm install --legacy-peer-deps
```

**Note:** We use `--legacy-peer-deps` to resolve potential dependency conflicts with newer npm versions.

### Step 2: Build for Production

Run the webpack build command to create production-ready files:

```bash
npx webpack --mode production
```

This will create a `dist/` directory containing:
- `simple11.html` - Your main HTML file
- `simple11.js` - Bundled JavaScript
- `simple11.js.map` - Source map for debugging
- Any other required assets

### Step 3: Verify the Build

Check that the `dist/` folder was created successfully:

```bash
ls -la dist/
```

You should see the built files listed above.

---

## Deployment Options

Choose one of the following deployment methods based on your preference and technical expertise:

### Option 1: GitHub Pages (Free and Integrated)

**Advantages:** Free, easy setup, automatic HTTPS, works great with custom domains

**Steps:**

1. **Enable GitHub Pages in your repository:**
   - Go to your GitHub repository settings
   - Scroll to "Pages" section
   - Under "Source", select the branch you want to deploy (e.g., `main` or create a `gh-pages` branch)
   - Select `/root` or `/docs` folder (you'll need to configure this)

2. **Set up automatic deployment:**
   
   Create a file `.github/workflows/deploy-gh-pages.yml` (note: this file has already been created in this repository):
   
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v3
       
       - name: Setup Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '16'
       
       - name: Install dependencies
         run: npm install --legacy-peer-deps
       
       - name: Build
         run: npx webpack --mode production
       
       - name: Deploy to GitHub Pages
         uses: peaceiris/actions-gh-pages@v3
         with:
           github_token: ${{ secrets.GITHUB_TOKEN }}
           publish_dir: ./dist
   ```

3. **Configure your custom domain:**
   - In repository settings → Pages → Custom domain
   - Enter your domain (e.g., `sims4viz.yourdomain.com`)
   - Create a `CNAME` file in your `dist` directory with your domain name

4. **Update DNS settings** (see [Domain Configuration](#domain-configuration))

---

### Option 2: Netlify (Easiest with Great Features)

**Advantages:** Free tier available, automatic HTTPS, continuous deployment, easy domain setup, preview deployments

**Steps:**

1. **Sign up at [Netlify](https://www.netlify.com/)**

2. **Connect your GitHub repository:**
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Configure build settings:
     - **Build command:** `npx webpack --mode production`
     - **Publish directory:** `dist`
     - **Base directory:** (leave empty)

3. **Deploy:**
   - Click "Deploy site"
   - Netlify will build and deploy automatically

4. **Add custom domain:**
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter your domain name
   - Follow Netlify's DNS configuration instructions

5. **Enable HTTPS:**
   - Netlify automatically provides free SSL certificates via Let's Encrypt

---

### Option 3: Vercel (Modern and Fast)

**Advantages:** Excellent performance, free tier, automatic HTTPS, great for static sites

**Steps:**

1. **Sign up at [Vercel](https://vercel.com/)**

2. **Import your project:**
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure build settings:**
   - **Framework Preset:** Other
   - **Build Command:** `npx webpack --mode production`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install --legacy-peer-deps`

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy automatically

5. **Add custom domain:**
   - Go to Project settings → Domains
   - Add your custom domain
   - Follow Vercel's DNS configuration instructions

---

### Option 4: Traditional Web Hosting (cPanel/FTP)

**Advantages:** Works with traditional hosting providers, full control

**Steps:**

1. **Build locally:**
   ```bash
   npm install --legacy-peer-deps
   npx webpack --mode production
   ```

2. **Upload files:**
   - Connect to your hosting via FTP (FileZilla, WinSCP, or cPanel File Manager)
   - Navigate to your public_html or www directory
   - Upload ALL files from the `dist/` directory
   - **Important:** Also upload the `data/` directory if it contains required JSON files

3. **Set up your domain:**
   - Point your domain to your hosting provider's nameservers
   - Configure your domain in cPanel or hosting control panel
   - Access via your custom domain

---

### Option 5: AWS S3 + CloudFront (Advanced)

**Advantages:** Scalable, high performance, pay-as-you-go

**Steps:**

1. **Create an S3 bucket:**
   - Name it after your domain (e.g., `sims4viz.yourdomain.com`)
   - Enable static website hosting
   - Set bucket policy for public read access

2. **Upload files:**
   ```bash
   npm install --legacy-peer-deps
   npx webpack --mode production
   aws s3 sync dist/ s3://your-bucket-name/ --delete
   ```

3. **Set up CloudFront distribution:**
   - Create a CloudFront distribution pointing to your S3 bucket
   - Configure custom domain (CNAME)
   - Set up SSL certificate via AWS Certificate Manager

4. **Update DNS** (see [Domain Configuration](#domain-configuration))

---

## Domain Configuration

### DNS Settings

Depending on your deployment method, configure your DNS records:

#### For GitHub Pages:
Add these DNS records (create separate entries for each A record):

```
Type: A
Name: @ (or leave blank for root domain)
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153

Type: CNAME
Name: www
Value: yourusername.github.io
```

#### For Netlify:
```
Type: CNAME
Name: @ (or your subdomain)
Value: [your-site-name].netlify.app
```

Or use Netlify DNS (recommended) for easier management.

#### For Vercel:
```
Type: CNAME
Name: @ (or your subdomain)
Value: cname.vercel-dns.com
```

#### For Traditional Hosting:
```
Type: A
Name: @
Value: [Your hosting server IP address]

Type: CNAME
Name: www
Value: yourdomain.com
```

### DNS Propagation

- DNS changes can take 24-48 hours to fully propagate
- Test using tools like [whatsmydns.net](https://www.whatsmydns.net/)
- Clear your browser cache if the old site still appears

---

## Important Considerations

### File Paths and Data

1. **Check data file paths:** The application loads data from the `data/` directory. Ensure these files are accessible after deployment.

2. **Update webpack configuration if needed:** The current config outputs to `dist/`. If you need a different structure, modify `webpack.config.js`.

3. **Consider data file hosting:** If your JSON data files are large, consider hosting them separately or using a CDN.

### Performance Optimization

1. **Enable gzip/brotli compression** on your hosting platform
2. **Use a CDN** for better global performance
3. **Enable caching headers** for static assets
4. **Optimize your JSON data files** if they're very large

### Security

1. **Use HTTPS:** All modern hosting platforms provide free SSL certificates
2. **Set proper CORS headers** if loading data from external sources
3. **Don't commit sensitive data** to your repository

---

## Troubleshooting

### Build Fails

**Problem:** `npm install` fails with version errors

**Solution:** Use `npm install --legacy-peer-deps`

---

**Problem:** webpack not found

**Solution:** Use `npx webpack` instead of `webpack`, or install globally with `npm install -g webpack-cli`

---

### Site Doesn't Load

**Problem:** Blank page or 404 errors

**Solutions:**
- Check browser console for errors
- Verify all files in `dist/` were uploaded
- Check file paths in your HTML
- Ensure `data/` directory is accessible
- Check that your index file is named correctly for your hosting platform

---

**Problem:** Data doesn't load

**Solution:** 
- Verify data file paths in `app/js/simple11.js`
- Check browser network tab for failed requests
- Ensure data files are in the correct relative location

---

### Domain Issues

**Problem:** Domain not resolving

**Solutions:**
- Wait for DNS propagation (24-48 hours)
- Check DNS records are configured correctly
- Use DNS checker tools
- Clear browser DNS cache: `chrome://net-internals/#dns`

---

**Problem:** "Not Secure" warning

**Solution:** 
- Enable SSL/HTTPS in your hosting platform
- Most modern platforms provide free Let's Encrypt certificates
- For GitHub Pages, it may take a few minutes after adding custom domain

---

## Recommended Deployment Method

For beginners with a custom domain, we recommend **Netlify** because:

1. ✅ Free tier is generous
2. ✅ Automatic builds from GitHub
3. ✅ Easy custom domain setup
4. ✅ Free HTTPS/SSL certificates
5. ✅ Simple DNS configuration
6. ✅ Great documentation
7. ✅ Preview deployments for testing

---

## Step-by-Step Netlify Deployment

Here's a complete walkthrough for the recommended option:

1. **Prepare your repository:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Sign up for Netlify:**
   - Go to https://netlify.com
   - Click "Sign up" and use GitHub to authenticate

3. **Create new site:**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" as your Git provider
   - Authorize Netlify to access your repositories
   - Select "Sims4StorylineVis" repository

4. **Configure build settings:**
   - **Site name:** Choose a name (e.g., sims4viz)
   - **Branch to deploy:** main
   - **Build command:** `npx webpack --mode production`
   - **Publish directory:** `dist`
   - Click "Show advanced" → "New variable"
     - Key: `NPM_FLAGS`
     - Value: `--legacy-peer-deps`

5. **Deploy:**
   - Click "Deploy site"
   - Wait for build to complete (2-5 minutes)
   - Your site will be live at `https://[site-name].netlify.app`

6. **Add your custom domain:**
   - Go to "Site settings" → "Domain management"
   - Click "Add custom domain"
   - Enter your domain (e.g., `sims4viz.com`)
   - Click "Verify"

7. **Configure DNS:**
   - Netlify will show you the DNS records to add
   - Log in to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add the CNAME or A records as instructed by Netlify
   - Wait for DNS to propagate (can take up to 48 hours)

8. **Enable HTTPS:**
   - After DNS propagates, go back to Netlify
   - In "Domain management", click "Verify DNS configuration"
   - Click "Provision certificate"
   - HTTPS will be enabled automatically

9. **Test your site:**
   - Visit `https://yourdomain.com`
   - Verify the visualization loads correctly
   - Check that all data files load properly

---

## Continuous Deployment

Once set up with Netlify, Vercel, or GitHub Pages:

1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Your site will automatically rebuild and deploy
4. Changes will be live in 2-5 minutes

---

## Need Help?

- Check the [Netlify documentation](https://docs.netlify.com/)
- Visit the [Vercel documentation](https://vercel.com/docs)
- Review [GitHub Pages docs](https://docs.github.com/en/pages)
- Check your hosting provider's documentation

---

## Summary

The easiest path to deployment:

1. ✅ Push your code to GitHub (if not already there)
2. ✅ Sign up for Netlify (free)
3. ✅ Connect your GitHub repository
4. ✅ Set build command: `npx webpack --mode production`
5. ✅ Set publish directory: `dist`
6. ✅ Deploy!
7. ✅ Add your custom domain in Netlify settings
8. ✅ Update DNS records at your domain registrar
9. ✅ Wait for DNS propagation
10. ✅ Visit your site at your custom domain

---

**That's it!** Your Sims 4 Storyline Visualization should now be live on your custom domain. 🎉
