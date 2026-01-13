# Deployment Troubleshooting Checklist

Use this checklist to diagnose and fix common deployment issues.

## ✅ Pre-Deployment Checklist

- [ ] Node.js (>= 10.0) is installed
- [ ] npm is installed
- [ ] Dependencies installed with `npm install --legacy-peer-deps`
- [ ] Project builds successfully with `npx webpack --mode production`
- [ ] `dist/` directory is created after build
- [ ] `dist/` contains `simple11.html` and `simple11.js`
- [ ] Data files exist in `data/json/` directory

---

## 🔧 Build Issues

### ❌ `npm install` fails

**Symptoms:**
- Error about invalid versions
- Peer dependency conflicts

**Solutions:**
- ✅ Use `npm install --legacy-peer-deps`
- ✅ Clear npm cache: `npm cache clean --force`
- ✅ Delete `node_modules` and `package-lock.json`, then reinstall
- ✅ Try Node.js version 16 or 18 if using newer versions

---

### ❌ `webpack` command not found

**Symptoms:**
- "webpack: command not found" error

**Solutions:**
- ✅ Use `npx webpack --mode production` instead of `webpack`
- ✅ Or install globally: `npm install -g webpack webpack-cli`
- ✅ Check if webpack is in `devDependencies` in package.json

---

### ❌ Build produces empty or missing files

**Symptoms:**
- `dist/` folder is empty or missing files
- Build completes but no output

**Solutions:**
- ✅ Check webpack.config.js output path is correct
- ✅ Verify entry file exists: `app/js/simple11.js`
- ✅ Check for webpack errors in console
- ✅ Try deleting `dist/` and rebuilding

---

## 🌐 Deployment Issues

### ❌ Site shows blank page

**Symptoms:**
- White/blank screen after deployment
- Browser shows nothing

**Solutions:**
- ✅ Open browser developer console (F12) and check for errors
- ✅ Check Network tab for failed resource loads
- ✅ Verify all files from `dist/` were uploaded
- ✅ Check file paths are correct (relative vs absolute)
- ✅ Ensure `data/` directory is accessible
- ✅ Check if JavaScript files are loading (Network tab)

---

### ❌ Data doesn't load

**Symptoms:**
- Site loads but no visualization appears
- "Loading" message stays forever
- Console errors about failed fetch/AJAX requests

**Solutions:**
- ✅ Check browser console for 404 errors
- ✅ Verify data files are in correct location
- ✅ Check CORS settings if data is on different domain
- ✅ Inspect file paths in `app/js/simple11.js`:
  ```javascript
  // Example: loading data files
  const jsonRead = d3Fetch.json('../../data/json/Match11/Story_Events_DataFull.json')
  const jsonReadTwo = d3Fetch.json('../../data/json/Match11/simsTestFull.json')
  ```
- ✅ Ensure data files are not being blocked by `.gitignore`
- ✅ Verify JSON files are valid (use JSONLint.com)

---

### ❌ Images/assets don't load

**Symptoms:**
- Broken image icons
- Missing CSS styles
- 404 errors in Network tab

**Solutions:**
- ✅ Check image paths are relative to HTML file location
- ✅ Verify images were included in build/upload
- ✅ Check for case-sensitive filename issues (Linux servers)
- ✅ Ensure image files aren't in `.gitignore`

---

## 🔗 Domain Issues

### ❌ Domain doesn't resolve

**Symptoms:**
- "Site can't be reached"
- "DNS_PROBE_FINISHED_NXDOMAIN"

**Solutions:**
- ✅ Wait 24-48 hours for DNS propagation
- ✅ Check DNS records at your registrar
- ✅ Use [whatsmydns.net](https://www.whatsmydns.net/) to check propagation
- ✅ Verify DNS records match hosting provider's requirements
- ✅ Clear browser DNS cache: chrome://net-internals/#dns (Chrome)
- ✅ Try accessing from different device/network
- ✅ Verify domain hasn't expired

---

### ❌ "Not Secure" / No HTTPS

**Symptoms:**
- Browser shows "Not Secure" warning
- No padlock icon
- http:// instead of https://

**Solutions:**
- ✅ Enable SSL/HTTPS in hosting platform settings
- ✅ For Netlify/Vercel: SSL is automatic after DNS propagation
- ✅ For GitHub Pages: Enable HTTPS in repository settings
- ✅ Wait a few hours after DNS propagation
- ✅ Check SSL certificate is provisioned
- ✅ Force HTTPS redirect in hosting settings

---

### ❌ Shows wrong/old site

**Symptoms:**
- Old version of site appears
- Changes don't appear
- Previous content still showing

**Solutions:**
- ✅ Clear browser cache (Ctrl+Shift+Delete)
- ✅ Try incognito/private browsing mode
- ✅ Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- ✅ Check if correct files were deployed
- ✅ Verify build completed successfully
- ✅ Check CDN cache settings
- ✅ Wait for CDN cache to clear (can take minutes to hours)

---

## 🚀 Platform-Specific Issues

### Netlify

**Problem:** Build fails on Netlify but works locally

**Solutions:**
- ✅ Add environment variable: `NPM_FLAGS = --legacy-peer-deps`
- ✅ Check Node version in build logs matches local
- ✅ Verify build command: `npx webpack --mode production`
- ✅ Check publish directory: `dist`
- ✅ Review build logs for specific errors

---

**Problem:** "Page not found" after deployment

**Solutions:**
- ✅ Check your main HTML file is in the publish directory
- ✅ Add redirect rules in `netlify.toml` if needed
- ✅ Verify `dist/` directory contains `simple11.html`

---

### GitHub Pages

**Problem:** 404 error on GitHub Pages

**Solutions:**
- ✅ Ensure GitHub Pages is enabled in repository settings
- ✅ Check correct branch is selected
- ✅ Verify files are in root or `/docs` folder (as configured)
- ✅ Wait a few minutes after enabling
- ✅ Check workflow ran successfully (if using Actions)

---

**Problem:** Workflow doesn't trigger

**Solutions:**
- ✅ Uncomment the `on:` section in deploy-gh-pages.yml
- ✅ Verify workflow file is in `.github/workflows/`
- ✅ Check branch name matches (main vs master)
- ✅ Enable Actions in repository settings

---

### Vercel

**Problem:** Build fails on Vercel

**Solutions:**
- ✅ Set install command: `npm install --legacy-peer-deps`
- ✅ Set build command: `npx webpack --mode production`
- ✅ Set output directory: `dist`
- ✅ Check environment variables if needed

---

### Traditional Hosting (cPanel/FTP)

**Problem:** Files uploaded but site doesn't work

**Solutions:**
- ✅ Verify files are in correct directory (public_html or www)
- ✅ Check file permissions (644 for files, 755 for directories)
- ✅ Ensure all files including subdirectories were uploaded
- ✅ Check .htaccess file isn't blocking resources
- ✅ Verify domain points to correct directory

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console

1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for red error messages
4. Note any failed requests

### Step 2: Check Network Tab

1. Open Developer Tools (F12)
2. Go to Network tab
3. Refresh page
4. Look for failed requests (red status)
5. Check what resources failed to load

### Step 3: Verify File Structure

After deployment, check that your hosting has:
```
your-domain.com/
├── simple11.html (or index.html)
├── simple11.js
├── simple11.js.map
└── data/
    └── json/
        └── (your data files)
```

### Step 4: Test Locally

Before deploying, test the built version locally:

```bash
# Build the project
npx webpack --mode production

# Serve the dist folder locally
cd dist
python -m http.server 8000
# or
npx serve .

# Visit http://localhost:8000/simple11.html
```

If it works locally but not on hosting, the issue is with deployment.

---

## 📞 Getting Help

If you're still stuck:

1. **Check hosting provider docs:** Most have deployment guides
2. **Review build logs:** Look for specific error messages
3. **Search the error:** Google the exact error message
4. **Check repository issues:** See if others had similar problems
5. **Contact support:** Most hosting platforms have free support

---

## 📋 Information to Collect

When seeking help, provide:

- [ ] Hosting platform being used
- [ ] Domain name (if applicable)
- [ ] Error messages from browser console
- [ ] Error messages from build logs
- [ ] Screenshots of the issue
- [ ] Steps you've already tried
- [ ] Link to deployed site (if accessible)

---

## ✅ Success Checklist

Your deployment is successful when:

- [ ] Site loads at your domain (with HTTPS)
- [ ] No errors in browser console
- [ ] Visualization appears and loads
- [ ] Data loads correctly
- [ ] Interactive features work (zoom, filter, etc.)
- [ ] Site is accessible from different devices/networks

---

**Remember:** Most issues are due to incorrect file paths, missing files, or DNS propagation delays. Be patient and systematic in your troubleshooting!
