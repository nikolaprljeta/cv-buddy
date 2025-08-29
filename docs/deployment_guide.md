# Deployment Guide

This project is a static HTML/CSS/JavaScript application. No build process or backend is required.

## Deployment Options

### 1. GitHub Pages
1. Push your latest code to the `main` branch.
2. Go to **Settings** → **Pages**.
3. Under "Source", select the `main` branch and `/ (root)` folder.
4. Click **Save**. Your site will be available at:
   `https://USERNAME.github.io/REPO-NAME`

### 2. Netlify
1. Go to [Netlify](https://www.netlify.com/).
2. Click **Add new site** → **Import an existing project**.
3. Connect your GitHub repository.
4. Select the branch (usually `main`) and leave build command empty.
5. Set publish directory to `/`.
6. Click **Deploy site**.

### 3. Local Hosting
If you just want to test locally:
```bash
# Using Python 3
python -m http.server 8000
```
Then visit `http://localhost:8000`.

---
**Tip:** Always check that your assets (images, CSS, JS) use relative paths so they work in any hosting environment.
