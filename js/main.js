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

    function populateCV(data) {
        if (leftColumn) leftColumn.innerHTML = '';
        if (rightColumn) rightColumn.innerHTML = '';

        if (data.sections && Array.isArray(data.sections)) {
            data.sections.forEach(section => {
                const sectionElem = createSectionElement(section);
                if (!sectionElem) return;
                if (section.column === 'left') {
                    leftColumn.appendChild(sectionElem);
                } else {
                    rightColumn.appendChild(sectionElem);
                }
            });
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
                if (cvData && cvData.name) {
                    const markdownContent = convertCvToMarkdown(cvData);
                    const fileName = `${cvData.name.replace(/\s+/g, '_')}_CV_${currentLang}.md`;
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
                } else {
                    showMessage('No CV data available for export. Please ensure CV is loaded.', 'error');
                    console.error('Export to MD: cvData or cvData.name is missing.', cvData);
                }
            } catch (error) {
                console.error('Error during Markdown export:', error);
                showMessage('An error occurred during Markdown export. Check console.', 'error');
            }
            toggleFab();
        });
    }

    if (fabExportEncryptedMdButton) {
        fabExportEncryptedMdButton.addEventListener('click', function() {
            currentPasswordAction = 'exportEncrypted';
            showPasswordModal('exportEncrypted');
            toggleFab();
        });
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
                    const markdownContent = convertCvToMarkdown(cvData);
                    const obfuscatedContent = xorEncryptDecrypt(markdownContent, password);
                    const fileName = `${cvData.name.replace(/\s+/g, '_')}_CV_${currentLang}_obfuscated.md`;
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
