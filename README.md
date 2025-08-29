# 📄 CV Viewer

A lightweight **HTML/CSS/JavaScript** web application for displaying your CV or résumé in a clean, responsive layout.  
All content is loaded from easily editable **JSON files**, so you can update your details without touching the HTML.

---

## 📑 Table of Contents
- [⚡ Features](#-features)
- [🛠 Installation](#-installation)
- [🚀 Usage](#-usage)
- [⚙️ Configuration / Examples](#-configuration--examples)
- [📝 Contributing](#-contributing)
- [⚖️ License](#-license)
- [⚠️ Disclaimer](#-disclaimer)

---

## ⚡ Features
- Clean, responsive design for any screen size  
- Multi-language support via JSON files  
- Automatic detection of newly added languages in the UI  
- Simple GitHub Pages deployment  
- No build tools or frameworks required  

---

## 🛠 Installation

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Customize Your Data**  
   - Open the `data` folder.  
   - Edit the JSON files (e.g., `cvData_en.json`, `cvData_fr.json`).  
   - To add a new language:
     1. Copy an existing JSON file.
     2. Rename it using the language code (`cvData_es.json` for Spanish).
     3. Translate/modify while keeping the same keys.  

3. **Update Your Profile Photo**  
   - Replace `profile.jpg` in `assets`.  
   - Recommended size: **300×300px**.  
   - Keep the same filename to avoid HTML changes.  

---

## 🚀 Usage

**Option A — Using Live Server**  
```bash
npm install -g live-server
live-server
```

**Option B — Open Directly in Browser**  
- Double-click `index.html`.  
- If JSON fails to load due to browser security, use Live Server.  

---

## ⚙️ Configuration / Examples

- JSON files can hold text in **any language**; the app will detect and show them automatically.  
- You can have as many language files as you want (`cvData_*.json`).  
- Recommended JSON structure:
  ```json
  {
    "name": "John Doe",
    "title": "Software Engineer",
    "experience": []
  }
  ```
- To preview changes, reload the browser page.  
- Works entirely client-side — no backend needed.  

---

## 📝 Contributing

Contributions are welcome!  
- Fork the repo  
- Create a feature branch (`git checkout -b feature-name`)  
- Commit changes (`git commit -m "Add feature"`)  
- Push and open a Pull Request  

Please follow the existing coding style and keep JSON syntax valid.

---

## ⚖️ License

This project is licensed under the [MIT License](LICENSE).  

---

## ⚠️ Disclaimer

This project is intended for personal CV or résumé presentation purposes only.  
The author is not responsible for how the code or design is used in contexts that violate privacy, intellectual property, or any applicable laws.  
