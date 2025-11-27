# Frequently Asked Questions (FAQ)

---

### Q1: How do I add a new language to CV Buddy?

**A:** Copy an existing JSON file in the `data/` folder, rename it to the desired language code (e.g., `es.json`), then translate the content keeping the same keys.

---

### Q2: Can I customize the layout or design?

**A:** Yes! Modify the CSS files in the `css/` folder and HTML templates in `html/` to adjust styles and layout.

---

### Q3: How do I update my profile picture?

**A:** Replace `assets/profile.jpg` with your image. Recommended size is 300×300 pixels.

---

### Q4: I’m seeing errors when opening `index.html` directly in my browser. What can I do?

**A:** Some browsers block local `fetch()` calls due to security policies. Use a local server like VS Code’s Live Server or run `live-server` via npm.

---

### Q5: How do I deploy my CV online?

**A:** Use GitHub Pages or any static host like Netlify. See the Deployment Guide for step-by-step instructions.

---

### Q6: How can I contribute to CV Buddy?

**A:** See the Contribution Guidelines in the docs or the root `CONTRIBUTING.md` file.

---

If you have other questions, feel free to open an issue on GitHub or contact the maintainer.
