import { fetchCvData } from './cvLoader.js';
import { createSectionElement } from './sectionRenderer.js';
import { convertCvToMarkdown } from './markdownExport.js';
import { xorEncryptDecrypt } from './encryption.js';
import { showMessage } from './messageBox.js';
import { showPasswordModal, hidePasswordModal } from './passwordModal.js';

document.addEventListener('DOMContentLoaded', function() {
    let currentLang = 'en';
    let cvData = {};
    let availableLangs = [];
    let languageNamesMap = {};
    let currentPasswordAction = null;

    const profileImage = document.getElementById('profileImage');
    const profileImageModal = document.getElementById('profileImageModal');
    const enlargedProfileImage = document.getElementById('enlargedProfileImage');
    const fabContainer = document.getElementById('fabContainer');
    const fabMainButton = document.getElementById('fabMainButton');
    const fabPrintButton = document.getElementById('fabPrintButton');
    const fabExportMdButton = document.getElementById('fabExportMdButton');
    const fabExportEncryptedMdButton = document.getElementById('fabExportEncryptedMdButton');
    const fabExportTxtButton = document.getElementById('fabExportTxtButton');
    const fabExportJsonButton = document.getElementById('fabExportJsonButton');
    const fabExportHtmlButton = document.getElementById('fabExportHtmlButton');
    if (fabExportHtmlButton) {
        fabExportHtmlButton.addEventListener('click', function() {
            try {
                if (cvData && typeof cvData === 'object') {
                    const csvRows = [];
                    for (const section in cvData) {
                        if (Array.isArray(cvData[section])) {
                            cvData[section].forEach(item => {
                                const row = Object.values(item).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
                                csvRows.push(row);
                            });
                        } else if (typeof cvData[section] === 'object') {
                            const row = Object.values(cvData[section]).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
                            csvRows.push(row);
                        } else {
                            csvRows.push(`"${section}","${String(cvData[section]).replace(/"/g, '""')}"`);
                        }
                    }
                    const csvContent = csvRows.join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'nikola-prljeta-cv.csv';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    showMessage('CV data is not available for CSV export.', 'error');
                }
            } catch (err) {
                console.error('CSV export failed:', err);
                showMessage('CSV export failed.', 'error');
            }
            toggleFab();
        });
    }

    if (fabExportTxtButton) {
        fabExportTxtButton.addEventListener('click', function() {
            try {
                if (cvData && typeof cvData === 'object') {
                    let txtContent = '';
                    for (const section in cvData) {
                        txtContent += section + '\n';
                        if (Array.isArray(cvData[section])) {
                            cvData[section].forEach(item => {
                                txtContent += Object.values(item).join(', ') + '\n';
                            });
                        } else if (typeof cvData[section] === 'object') {
                            txtContent += Object.values(cvData[section]).join(', ') + '\n';
                        } else {
                            txtContent += String(cvData[section]) + '\n';
                        }
                        txtContent += '\n';
                    }
                    const blob = new Blob([txtContent], { type: 'text/plain' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'nikola-prljeta-cv.txt';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    showMessage('CV data is not available for TXT export.', 'error');
                }
            } catch (err) {
                console.error('TXT export failed:', err);
                showMessage('TXT export failed.', 'error');
            }
            toggleFab();
        });
    }

    if (fabExportJsonButton) {
        fabExportJsonButton.addEventListener('click', function() {
            try {
                if (cvData && typeof cvData === 'object') {
                    const jsonContent = JSON.stringify(cvData, null, 2);
                    const blob = new Blob([jsonContent], { type: 'application/json' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'nikola-prljeta-cv.json';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    showMessage('CV data is not available for JSON export.', 'error');
                }
            } catch (err) {
                console.error('JSON export failed:', err);
                showMessage('JSON export failed.', 'error');
            }
            toggleFab();
        });
    }
    const leftColumn = document.getElementById('leftColumn');
    const rightColumn = document.getElementById('rightColumn');
    const contactLinksContainer = document.getElementById('contactLinks');
    const printEmailContactDiv = document.getElementById('printEmailContact');
    const languagesPrintList = document.getElementById('languagesPrintList');
    const printThemeStylesheet = document.getElementById('printThemeStylesheet');
    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const confirmPasswordBtn = document.getElementById('confirmPasswordBtn');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    const passwordError = document.getElementById('passwordError');

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

    function renderLanguageList(languageSectionElem) {
        if (!languageSectionElem) return;
        const langList = languageSectionElem.querySelector('#dynamicLanguageDisplayList');
        if (!langList) return;
        langList.innerHTML = '';
        availableLangs.forEach(langCode => {
            let li = document.createElement('li');
            li.className = 'language-list-item' + (langCode === currentLang ? ' active' : '');
            li.dataset.lang = langCode;
            li.textContent = languageNamesMap[langCode] || langCode.toUpperCase();
            li.addEventListener('click', async () => {
                if (langCode !== currentLang) {
                    currentLang = langCode;
                    const data = await fetchCvData(currentLang);
                    if (data) {
                        cvData = data;
                        populateCV(data);
                    }
                }
            });
            langList.appendChild(li);
        });
    }

    function populateCV(data) {
        if (leftColumn) leftColumn.innerHTML = '';
        if (rightColumn) rightColumn.innerHTML = '';

        let languageSectionElem = null;
        if (data.sections && Array.isArray(data.sections)) {
            data.sections.forEach(section => {
                const sectionElem = createSectionElement(section);
                if (!sectionElem) return;
                if (section.column === 'left') {
                    leftColumn.appendChild(sectionElem);
                    if (section.type === 'languages') {
                        languageSectionElem = sectionElem;
                    }
                } else {
                    rightColumn.appendChild(sectionElem);
                }
            });
        }
        if (languageSectionElem) {
            renderLanguageList(languageSectionElem);
        }
        const cvName = document.getElementById('cvName');
        const cvSummary = document.getElementById('cvSummary');
        if (cvName && data.name) cvName.textContent = data.name;
        if (cvSummary && data.summary) cvSummary.textContent = data.summary;
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
                    languageNamesMap[langCode] = langCode;
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
            console.error("No CV data files found for any supported language.");
            return;
        }

        const data = await fetchCvData(currentLang);
        if (data) {
            try {
                cvData = data;
                populateCV(data);
            } catch (e) {
                console.error("Error populating CV:", e);
            }
        } else {
            console.error("Failed to load initial CV data. Using a minimal fallback structure.");
            populateCV({
                name: 'CV Not Loaded',
                summary: 'Please ensure cvData_en.json (or other language files) are correctly located and formatted.',
                contact: [],
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
                if (!cvData || !cvData.name) {
                    showMessage('No CV data available for export. Please ensure CV is loaded.', 'error');
                    console.error('Export to MD: cvData or cvData.name is missing.', cvData);
                    toggleFab();
                    return;
                }
                const markdownContent = convertCvToMarkdown(cvData, availableLangs, languageNamesMap);
                if (!markdownContent) {
                    showMessage('Markdown conversion failed.', 'error');
                    console.error('Markdown conversion failed. cvData:', cvData);
                    toggleFab();
                    return;
                }
                const fileName = 'nikola-prljeta-cv.md';
                try {
                    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showMessage('CV exported to Markdown!', 'success');
                } catch (fileErr) {
                    showMessage('File download failed.', 'error');
                    console.error('File download failed:', fileErr);
                }
            } catch (error) {
                showMessage('An error occurred during Markdown export. Check console.', 'error');
                console.error('Error during Markdown export:', error);
            }
            toggleFab();
        });
    }

    if (fabExportEncryptedMdButton) {
    }

    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener('click', hidePasswordModal);
    }

    if (confirmPasswordBtn) {
        confirmPasswordBtn.addEventListener('click', function() {
            const password = passwordInput.value;
            if (!password) {
                passwordError.textContent = 'Password cannot be empty.';
                passwordError.classList.remove('hidden');
                return;
            }

            if (currentPasswordAction === 'exportEncrypted') {
                if (cvData && cvData.name) {
                    const markdownContent = convertCvToMarkdown(cvData, availableLangs, languageNamesMap);
                    const obfuscatedContent = xorEncryptDecrypt(markdownContent, password);
                    const fileName = 'nikola-prljeta-cv-obfuscated.md';
                    const blob = new Blob([obfuscatedContent], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    showMessage('CV exported as obfuscated Markdown!', 'success');
                } else {
                    showMessage('No CV data available for obfuscation. Please ensure CV is loaded.', 'error');
                    console.error('Export to Obfuscated MD: cvData or cvData.name is missing.', cvData);
                }
            }
            hidePasswordModal();
        });
    }

    document.addEventListener('click', function(event) {
        if (fabContainer && fabContainer.classList.contains('expanded') && !fabContainer.contains(event.target)) {
            toggleFab();
        }
    });
});
