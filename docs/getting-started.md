# Getting Started with CV Buddy

This guide will help you set up CV Buddy locally so you can customize and preview your résumé.

---

## 1. Clone the repository

Open your terminal and run:

```bash
git clone https://github.com/nikolaprljeta/cv-buddy.git
cd cv-buddy
```

---

## 2. Customize Your CV Data

- Navigate to the `data/` folder.
- You’ll find JSON files for each language, like `en.json` for English.
- To add a new language:
  1. Copy an existing JSON file.
  2. Rename it to the new language code (e.g., `fr.json` for French).
  3. Edit the content while keeping the same key structure.

---

## 3. Update Your Profile Picture

- Replace the image at `assets/profile.jpg` with your own.
- Recommended size: **300×300px** for best display.

---

## 4. Preview Locally

You have two options:

### Option A: Using Live Server (recommended)

If you have VS Code, install the **Live Server** extension and click "Go Live".

Or install globally with npm:

```bash
npm install -g live-server
live-server
```

### Option B: Open in Browser

- Open `index.html` in your browser directly.
- Note: Some browsers may block loading JSON files via `fetch()` without a server.  
  If you see errors, use Live Server instead.

---

## 5. Deploying Your CV Online

You can host your CV using GitHub Pages or any static web hosting service.  
For GitHub Pages:

- Push your code to the `main` branch.
- In your repo’s **Settings → Pages**, select `main` branch and root folder `/`.
- Your CV will be available at `https://your-username.github.io/cv-buddy/`.

---

Congratulations! You are now ready to use and customize CV Buddy.
