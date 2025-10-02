import { fetchCvData } from './cvLoader.js';
import { getAvailableLanguages } from './languageLoader.js';
import { createSectionElement } from './sectionRenderer.js';
import { convertCvToMarkdown } from './markdownExport.js';
import { convertCvToCsv } from './csvExport.js';
import { convertCvToText } from './txtExport.js';
import { convertCvToJson } from './jsonExport.js';
import { showMessage } from './messageBox.js';
import { handleExport } from './exportUtils.js';

document.addEventListener('DOMContentLoaded', function() {
window.switchLanguage = async function(langCode) {
    if (langCode !== window.currentLang) {
        window.currentLang = langCode;
        const data = await fetchCvData(langCode);
        if (data) {
            window.cvData = data;
            populateCV(data);
        }
    }
};

    window.currentLang = 'en';
    window.cvData = {};
    let availableLangs = [];
    let languageNamesMap = {};
    const profileImage = document.getElementById('profileImage');
    const profileImageModal = document.getElementById('profileImageModal');
    const enlargedProfileImage = document.getElementById('enlargedProfileImage');
    const fabContainer = document.getElementById('fabContainer');
    const fabMainButton = document.getElementById('fabMainButton');
    const fabPrintButton = document.getElementById('fabPrintButton');
    const fabExportMdButton = document.getElementById('fabExportMdButton');
    const fabExportTxtButton = document.getElementById('fabExportTxtButton');
    const fabExportJsonButton = document.getElementById('fabExportJsonButton');
    const fabExportHtmlButton = document.getElementById('fabExportHtmlButton');
    if (fabExportHtmlButton) {
        fabExportHtmlButton.addEventListener('click', function() {
            try {
                handleExport(
                    cvData, 
                    convertCvToCsv, 
                    'nikola-prljeta-cv.csv', 
                    'text/csv', 
                    'CSV', 
                    availableLangs, 
                    languageNamesMap
                );
            } catch (error) {
                showMessage('An error occurred during CSV export. Check console.', 'error');
                console.error('Error during CSV export:', error);
            }
            toggleFab();
        });
    }

    if (fabExportTxtButton) {
        fabExportTxtButton.addEventListener('click', function() {
            try {
                handleExport(
                    cvData, 
                    convertCvToText, 
                    'nikola-prljeta-cv.txt', 
                    'text/plain', 
                    'TXT', 
                    availableLangs, 
                    languageNamesMap
                );
            } catch (error) {
                showMessage('An error occurred during TXT export. Check console.', 'error');
                console.error('Error during TXT export:', error);
            }
            toggleFab();
        });
    }

    if (fabExportJsonButton) {
        fabExportJsonButton.addEventListener('click', function() {
            try {
                handleExport(
                    cvData, 
                    convertCvToJson, 
                    'nikola-prljeta-cv.json', 
                    'application/json', 
                    'JSON'
                );
            } catch (error) {
                showMessage('An error occurred during JSON export. Check console.', 'error');
                console.error('Error during JSON export:', error);
            }
            toggleFab();
        });
    }
    const leftColumn = document.getElementById('leftColumn');
    const rightColumn = document.getElementById('rightColumn');
    const printThemeStylesheet = document.getElementById('printThemeStylesheet');

    function openModal() {
        if (profileImage && enlargedProfileImage && profileImageModal) {
            enlargedProfileImage.src = profileImage.src;
            profileImageModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (profileImageModal) {
            profileImageModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (profileImage) {
        profileImage.addEventListener('click', openModal);
    }
    if (profileImageModal) {
        profileImageModal.addEventListener('click', closeModal);
    }

    async function renderLanguageList(languageSectionElem) {
        if (!languageSectionElem) return;
        const langList = languageSectionElem.querySelector('#dynamicLanguageDisplayList');
        if (!langList) return;
        langList.innerHTML = '';

        // Get all available language files
        let langs = [];
        try {
            langs = await getAvailableLanguages();
        } catch (e) {
            langs = ['en'];
        }

        // Fetch language names and filter out duplicates
        const seenCodes = new Set();
        const langData = [];
        for (const code of langs) {
            if (seenCodes.has(code)) continue;
            seenCodes.add(code);
            const data = await fetchCvData(code);
            let name = code.toUpperCase();
            if (data && data.sections) {
                const langSection = data.sections.find(s => s.languageName);
                if (langSection && langSection.languageName) {
                    name = langSection.languageName;
                }
            }
            langData.push({ code, name });
        }

        langData.forEach(({ code, name }) => {
            const li = document.createElement('li');
            li.className = 'list-item';
            if (code === window.currentLang) {
                li.style.fontWeight = 'bold';
            }
            const a = document.createElement('a');
            a.className = 'list-link';
            a.textContent = name;
            a.href = '#';
            a.onclick = (e) => {
                e.preventDefault();
                if (code !== window.currentLang) {
                    window.switchLanguage(code);
                }
            };
            li.appendChild(a);
            langList.appendChild(li);
        });
    }

    async function populateCV(data) {
        if (leftColumn) leftColumn.innerHTML = '';
        if (rightColumn) rightColumn.innerHTML = '';

        let languageSectionElem = null;
        if (data.sections && Array.isArray(data.sections)) {
            data.sections.forEach(section => {
                const sectionElem = createSectionElement(section);
                if (!sectionElem) return;
                if (section.column === 'left') {
                    leftColumn.appendChild(sectionElem);
                    if (section.title && section.title.toLowerCase().includes('lang')) {
                        languageSectionElem = sectionElem;
                    }
                } else {
                    rightColumn.appendChild(sectionElem);
                }
            });
        }
        // Create language section if not found in CV data (append at end as fallback)
        if (!languageSectionElem && leftColumn) {
            const langSectionDiv = document.createElement('div');
            langSectionDiv.className = 'section-item list-section';
            const title = document.createElement('h2');
            title.className = 'section-title';
            title.textContent = 'LANGUAGES';
            langSectionDiv.appendChild(title);
            const langList = document.createElement('ul');
            langList.id = 'dynamicLanguageDisplayList';
            langList.className = 'language-links-list';
            langSectionDiv.appendChild(langList);
            leftColumn.appendChild(langSectionDiv); // Append at end instead of forcing to top
            languageSectionElem = langSectionDiv;
        }
        if (languageSectionElem) {
            await renderLanguageList(languageSectionElem);
        }
        const cvName = document.getElementById('cvName');
        const cvSummary = document.getElementById('cvSummary');
        if (cvName && data.name) cvName.textContent = data.name;
        if (cvSummary && data.summary) cvSummary.textContent = data.summary;
    }

    async function loadInitialCV() {

        let langs;
        try {
            langs = await getAvailableLanguages();
        } catch (e) {
            // Fallback to static list if dynamic loading fails
            langs = ['en', 'sr', 'sv', 'fr', 'es', 'de', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'];
        }
        const browserLang = navigator.language.split('-')[0];

        const fetchPromises = langs.map(async (langCode) => {
            const data = await fetchCvData(langCode);
            if (data) {
                const langSection = data.sections.find(sec => sec.type === 'languages');
                if (langSection && langSection.current && langSection.current.language) {
                    languageNamesMap[langCode] = langSection.current.language;
                } else {
                    languageNamesMap[langCode] = langCode;
                }
                return langCode;
            }
            return null;
        });

        const results = await Promise.all(fetchPromises);
        availableLangs = results.filter(lang => lang !== null);

        if (availableLangs.includes(browserLang)) {
            window.currentLang = browserLang;
        } else if (availableLangs.includes('en')) {
            window.currentLang = 'en';
        } else if (availableLangs.length > 0) {
            window.currentLang = availableLangs[0];
        } else {
            console.error("No CV data files found for any supported language.");
            return;
        }

        const data = await fetchCvData(window.currentLang);
        if (data) {
            try {
                window.cvData = data;
                await populateCV(data);
            } catch (e) {
                console.error("Error populating CV:", e);
            }
        } else {
            console.error("Failed to load initial CV data. Using a minimal fallback structure.");
            await populateCV({
                name: 'CV Not Loaded',
                summary: 'Please ensure cvData_en.json (or other language files) are correctly located and formatted.',
                sections: []
            });
        }
    }

    loadInitialCV();

    function toggleFab() {
        if (fabContainer) {
            fabContainer.classList.toggle('expanded');
        }
    }

    if (fabMainButton) {
        fabMainButton.addEventListener('click', toggleFab);
    }

    if (fabPrintButton) {
        fabPrintButton.addEventListener('click', function() {
            if (printThemeStylesheet) {
                printThemeStylesheet.media = 'print';
            }
            window.print();
            setTimeout(() => {
                if (printThemeStylesheet) {
                    printThemeStylesheet.media = 'print';
                }
            }, 500);
            toggleFab();
        });
    }

    if (fabExportMdButton) {
        fabExportMdButton.addEventListener('click', function() {
            try {
                handleExport(
                    cvData, 
                    convertCvToMarkdown, 
                    'nikola-prljeta-cv.md', 
                    'text/markdown', 
                    'Markdown', 
                    availableLangs, 
                    languageNamesMap
                );
            } catch (error) {
                showMessage('An error occurred during Markdown export. Check console.', 'error');
                console.error('Error during Markdown export:', error);
            }
            toggleFab();
        });
    }


    document.addEventListener('click', function(event) {
        if (fabContainer && fabContainer.classList.contains('expanded') && !fabContainer.contains(event.target)) {
            toggleFab();
        }
    });
});
