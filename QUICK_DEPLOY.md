# Quick Deployment Reference

This is a condensed guide for deploying your Sims4StorylineVis project. For detailed instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## 🚀 Fastest Method: Netlify

### 1️⃣ Build Settings

```bash
Build command: npx webpack --mode production
Publish directory: dist
```

### 2️⃣ Environment Variable

Add this in Netlify's build settings:
```
NPM_FLAGS=--legacy-peer-deps
```

### 3️⃣ Steps

1. Sign up at [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect GitHub repository
4. Configure build settings (above)
5. Click "Deploy site"
6. Add custom domain in Site settings → Domain management
7. Update DNS at your domain registrar with Netlify's instructions

---

## 📦 Local Build Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build for production
npx webpack --mode production

# Output will be in dist/ directory
```

---

## 🌐 DNS Configuration

### For Netlify (Recommended)
```
Type: CNAME
Name: @ (or subdomain)
Value: [your-site].netlify.app
```

### For GitHub Pages
```
Type: A
Name: @
Values: 
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
```

---

## ⚠️ Important Files to Deploy

Make sure these are accessible:
- ✅ All files in `dist/` directory
- ✅ `data/` directory with JSON files
- ✅ Any images referenced in HTML/JS

---

## 🔧 Common Issues

**Build fails?** → Use `npm install --legacy-peer-deps`

**Blank page?** → Check browser console and network tab

**Data not loading?** → Verify `data/` directory is deployed

**Domain not working?** → Wait 24-48h for DNS propagation

---

## 📖 More Help

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for:
- Detailed step-by-step instructions
- Multiple deployment options
- Troubleshooting guide
- Domain configuration details
- Performance optimization tips

---

## ✨ Recommended: Netlify Deployment

**Why Netlify?**
- 🆓 Free for personal projects
- 🔒 Automatic HTTPS/SSL
- 🔄 Continuous deployment from Git
- 🌍 Global CDN
- 📱 Easy custom domain setup
- 📊 Built-in analytics

**Time to deploy:** ~10 minutes
**Time to propagate DNS:** 24-48 hours

---

Good luck with your deployment! 🎉
