function fetchCvData(lang) {
    return fetch(`../data/cvData_${lang}.json`)
        .then(response => {
            if (!response.ok) {
                // console.warn(`CV data for ${lang} not found or could not be loaded (status: ${response.status}).`);
                return null;
            }
            return response.json();
        })
        .catch(error => {
            // console.error(`Could not fetch CV data for ${lang}:`, error);
            return null;
        });
}

async function loadInitialCV() {
    const potentialLangs = ['en', 'sr', 'sv', 'fr', 'es', 'de', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'];
    const browserLang = navigator.language.split('-')[0];

    const fetchPromises = potentialLangs.map(async (langCode) => {
        const data = await fetchCvData(langCode);
        if (data) {
            const langSection = data.sections.find(sec => sec.type === 'languages');
            if (langSection && langSection.current && langSection.current.language) {
                languageNamesMap[langCode] = langSection.current.language;
            } else {
                languageNamesMap[langCode] = getLanguageDisplayName(langCode);
            }
            return langCode;
        }
        return null;
    });

    const results = await Promise.all(fetchPromises);
    availableLangs = results.filter(lang => lang !== null);

    if (availableLangs.includes(browserLang)) {
        currentLang = browserLang;
    } else if (availableLangs.includes('en')) {
        currentLang = 'en';
    } else if (availableLangs.length > 0) {
        currentLang = availableLangs[0];
    } else {
        // console.error("No CV data files found for any supported language.");
        showMessage("No CV data files found. Please ensure cvData_XX.json files are in the 'data' folder.", "error");
        return;
    }

    const data = await fetchCvData(currentLang);

    if (data) {
        try {
            populateCV(data);
        } catch (e) {
            // console.error("Error populating CV:", e);
            showMessage("An error occurred while rendering the CV. Check console for details.", "error");
        }
    } else {
        // console.error("Failed to load initial CV data. Using a minimal fallback structure.");
        populateCV({
            name: 'CV Not Loaded',
            summary: 'Please ensure cvData_en.json (or other language files) are correctly located and formatted.',
            contact: [],
            sections: []
        });
    }
}

export { fetchCvData, loadInitialCV };
