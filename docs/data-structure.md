# CV Data Structure

CV Buddy uses JSON files located in the `data/` folder to store all résumé content.

---

## File Structure

- Each language has its own JSON file, for example:
  - `cvData_en.json` — English
  - `cvData_fr.json` — French
  - `cvData_de.json` — German

---

## JSON Format

Each JSON file should follow the same key structure to ensure consistent loading and display.  

Here is an example snippet:

```json
{
  "name": "John Doe",
  "title": "Software Engineer",
  "contact": {
    "email": "john@example.com",
    "phone": "+123456789"
  },
  "education": [
    {
      "degree": "B.Sc. Computer Science",
      "institution": "University X",
      "year": "2015"
    }
  ],
  "experience": [
    {
      "position": "Frontend Developer",
      "company": "Company Y",
      "years": "2015-2018",
      "details": "Developed user interfaces using React."
    }
  ],
  "skills": ["JavaScript", "HTML", "CSS"]
}
```

---

## Adding or Updating Languages

To add a new language:

1. Copy an existing JSON file in `data/`.
2. Rename it to the appropriate language code (e.g., `es.json` for Spanish).
3. Translate or update the content while maintaining the key names.

---

## Important Notes

- Use double quotes for all keys and string values.
- Avoid trailing commas.
- Keep the JSON valid to prevent loading errors.

---

If you encounter any issues with your JSON files, validate them using online tools like [JSONLint](https://jsonlint.com/).
