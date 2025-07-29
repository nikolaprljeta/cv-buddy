document.addEventListener('DOMContentLoaded', function() {
    let currentLang = 'en';
    let cvData = {}; // Store the fetched CV data globally
    let availableLangs = []; // To store languages for which data was successfully loaded (e.g., ['en', 'sr', 'sv'])
    let languageNamesMap = {}; // Map to store native language names from JSON files (e.g., {'en': 'English', 'sr': 'Srpski'})

    const profileImage = document.getElementById('profileImage');
    const profileImageModal = document.getElementById('profileImageModal');
    const enlargedProfileImage = document.getElementById('enlargedProfileImage');

    // FAB elements
    const fabContainer = document.getElementById('fabContainer');
    const fabMainButton = document.getElementById('fabMainButton');
    const fabPrintButton = document.getElementById('fabPrintButton');
    // Removed: const fabSavePdfButton = document.getElementById('fabSavePdfButton');
    const fabExportMdButton = document.getElementById('fabExportMdButton');
    const fabExportEncryptedMdButton = document.getElementById('fabExportEncryptedMdButton');
    const fabSubButtonsContainer = document.getElementById('fabSubButtons');

    const leftColumn = document.getElementById('leftColumn');
    const rightColumn = document.getElementById('rightColumn');

    // Get contact links container and print email contact div
    const contactLinksContainer = document.getElementById('contactLinks');
    const printEmailContactDiv = document.getElementById('printEmailContact');
    const languagesPrintList = document.getElementById('languagesPrintList'); // Get the new print languages list


    // Removed: const pdfThemeStylesheet = document.getElementById('pdfThemeStylesheet');
    // Get the Print theme stylesheet link (now with an ID in cv.html)
    const printThemeStylesheet = document.getElementById('printThemeStylesheet');

    // Password Modal elements
    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const confirmPasswordBtn = document.getElementById('confirmPasswordBtn');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    const passwordError = document.getElementById('passwordError');

    let currentPasswordAction = null; // To store what action needs the password (e.g., 'exportEncrypted')


    // --- Modal Functions (Keep for profile image click) ---
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

    // --- Message Box Function (Keep) ---
    const messageBox = document.getElementById('messageBox');

    function showMessage(message, type = 'info', duration = 3000) {
        messageBox.textContent = message;
        messageBox.className = `message-box ${type} active`;
        setTimeout(() => {
            messageBox.classList.remove('active');
        }, duration);
    }

    // Functions to show/hide the password modal
    function showPasswordModal(action) {
        currentPasswordAction = action;
        passwordInput.value = ''; // Clear previous input
        passwordError.textContent = ''; // Clear previous error
        passwordError.classList.add('hidden'); // Hide error message
        passwordModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
        passwordInput.focus(); // Focus on the input field
    }

    function hidePasswordModal() {
        passwordModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        currentPasswordAction = null; // Reset action
    }

    // Simple XOR encryption/decryption (NOT cryptographically secure!)
    function xorEncryptDecrypt(text, key) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(result); // Base64 encode to handle non-printable characters
    }

    function xorDecrypt(encodedText, key) {
        try {
            const decoded = atob(encodedText); // Base64 decode
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return result;
        } catch (e) {
            console.error("Decryption error:", e);
            return null; // Indicate decryption failure
        }
    }

    // --- Function to convert CV data to Markdown string ---
    function convertCvToMarkdown(data) {
        let markdown = `# ${data.name}\n\n`;
        markdown += `## Summary\n\n${data.summary}\n\n`;

        // Contact Information
        if (data.contact && data.contact.length > 0) {
            markdown += `## Contact\n\n`;
            data.contact.forEach(link => {
                let url = link.url;
                if (link.label.toLowerCase() === 'email' || link.label.toLowerCase() === 'e-mail') {
                    url = url.replace('mailto:', '');
                }
                markdown += `- [${link.label}](${url})\n`;
            });
            markdown += `\n`;
        }

        // Sections
        data.sections.forEach(section => {
            let hasContent = false;
            if (section.type === 'list' || section.type === 'entries') {
                hasContent = section.items && section.items.length > 0;
            } else if (section.type === 'languages') {
                // For languages, content exists if there are available languages (from languageNamesMap)
                hasContent = availableLangs.length > 0;
            } else if (section.type === 'text') {
                hasContent = section.text;
            }

            if (!hasContent) return; // Skip section if no content

            markdown += `## ${section.title}\n\n`; // Section titles remain H2

            if (section.type === 'list') { // Handle generic list-type sections (skills, techStack, references)
                section.items.forEach(item => {
                    markdown += `- ${item}\n`;
                });
                markdown += `\n`;
            } else if (section.type === 'languages') { // Specific handling for languages
                // For Markdown, use the native language names from languageNamesMap
                availableLangs.forEach(langCode => {
                    let displayText = languageNamesMap[langCode] || langCode.toUpperCase();
                    markdown += `- ${displayText}\n`;
                });
                markdown += `\n`;
            } else if (section.type === 'entries') { // Handle entry-type sections (employment, education, courses, otherEmployment)
                section.items.forEach(item => {
                    markdown += `#### ${item.title}\n`; // Title on its own H4 line

                    let detailsLine = '';
                    if (item.company) {
                        detailsLine += item.company;
                    } else if (item.institution) {
                        detailsLine += item.institution;
                    }
                    if (item.location) {
                        if (detailsLine) detailsLine += ', ';
                        detailsLine += item.location;
                    }
                    if (detailsLine) {
                        markdown += `${detailsLine}\n`; // Company/Institution, Location on a new line
                    }

                    if (item.date) {
                        markdown += `(${item.date})\n`; // Date on its own new line, in parentheses
                    }

                    markdown += `\n`; // Add a blank line for separation before description

                    if (item.description) {
                        if (Array.isArray(item.description)) {
                            item.description.forEach(desc => {
                                markdown += `  - ${desc}\n`; // Indent bullet points for sub-items
                            });
                        } else {
                            markdown += `${item.description}\n`;
                        }
                    }
                    markdown += `\n`; // Add an extra newline after each entry for separation
                });
            } else if (section.type === 'text') { // Handle text-type sections (hobbies)
                if (section.text) {
                    markdown += `${section.text}\n\n`;
                }
            }
        });

        return markdown;
    }


    // --- Core CV Loading & Populating Functions (Keep) ---
    async function fetchCvData(lang) {
        try {
            const response = await fetch(`../data/cvData_${lang}.json`);
            if (!response.ok) {
                console.warn(`CV data for ${lang} not found or could not be loaded (status: ${response.status}).`);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error(`Could not fetch CV data for ${lang}:`, error);
            return null;
        }
    }

    // Function to create and append sections
    function createSectionElement(section) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = `section-item ${section.type}-section`;

        let hasContent = false;
        if (section.type === 'list' || section.type === 'entries') {
            hasContent = section.items && section.items.length > 0;
        } else if (section.type === 'languages') {
            // For languages section, content exists if there are available languages
            hasContent = availableLangs.length > 0;
        } else if (section.type === 'text') {
            hasContent = section.text;
        }

        if (!hasContent) return null;

        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = section.title;
        sectionDiv.appendChild(title);

        if (section.type === 'list') {
            const ul = document.createElement('ul');
            ul.className = 'bullet-list';
            section.items.forEach(item => {
                const li = document.createElement('li');
                li.className = 'language-list-item'; // Reusing this class for general list items
                li.textContent = item;
                ul.appendChild(li);
            });
            sectionDiv.appendChild(ul);
        } else if (section.type === 'languages') {
            const ul = document.createElement('ul');
            ul.className = 'bullet-list language-links-list';
            ul.id = 'dynamicLanguageDisplayList'; // ID for targeting the display list
            sectionDiv.appendChild(ul);
        } else if (section.type === 'entries') {
            section.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = `entry-item ${section.title.toLowerCase().replace(/\s+/g, '-')}-entry`;

                const itemTitle = document.createElement('h3');
                itemTitle.textContent = item.title;
                itemDiv.appendChild(itemTitle);

                const mainDetailsP = document.createElement('p');
                mainDetailsP.className = `entry-details`;
                let mainDetailsText = '';

                if (item.employer || item.company) {
                    mainDetailsText += `${item.employer || item.company}`;
                } else if (item.institution) {
                    mainDetailsText += `${item.institution}`;
                }
                if (item.location) {
                    if (mainDetailsText) mainDetailsText += ', ';
                    mainDetailsText += item.location;
                }
                if (mainDetailsText) {
                    mainDetailsP.textContent = mainDetailsText;
                    itemDiv.appendChild(mainDetailsP);
                }

                if (item.date) {
                    const dateP = document.createElement('p');
                    dateP.className = `entry-date`;
                    dateP.textContent = `(${item.date})`;
                    itemDiv.appendChild(dateP);
                }

                if (item.description) {
                    if (Array.isArray(item.description)) {
                        const ul = document.createElement('ul');
                        ul.className = 'bullet-list';
                        item.description.forEach(desc => {
                            const li = document.createElement('li');
                            li.className = 'language-list-item'; // Reusing this class for nested list items
                            li.textContent = desc;
                            ul.appendChild(li);
                        });
                        itemDiv.appendChild(ul);
                    } else {
                        const itemDescription = document.createElement('p');
                        itemDescription.className = 'item-description';
                        itemDescription.textContent = item.description;
                        itemDiv.appendChild(itemDescription);
                    }
                }
                sectionDiv.appendChild(itemDiv);
            });
        } else if (section.type === 'text') {
             const p = document.createElement('p');
             p.textContent = section.text || '';
             sectionDiv.appendChild(p);
        }
        return sectionDiv;
    }


    function populateCV(data) {
        cvData = data;
        document.title = `${data.name} CV`;

        document.getElementById('cvName').textContent = data.name;
        document.getElementById('cvSummary').textContent = data.summary;

        if (contactLinksContainer) {
            contactLinksContainer.innerHTML = '';
            if (data.contact && Array.isArray(data.contact)) {
                data.contact.forEach(link => {
                    if (link.label && link.url && link.icon) {
                        const a = document.createElement('a');
                        a.href = link.url;
                        a.className = 'contact-link';
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        a.innerHTML = `<i class="${link.icon}"></i> <span>${link.label}</span>`;
                        contactLinksContainer.appendChild(a);
                    }
                });
            }
        }

        if (printEmailContactDiv) {
            const emailContact = data.contact.find(link => link.label.toLowerCase() === 'email' || link.label.toLowerCase() === 'e-mail' || link.label.toLowerCase() === 'mail');
            if (emailContact) {
                printEmailContactDiv.innerHTML = '';
                printEmailContactDiv.appendChild(document.createTextNode('Contact: '));
                const aElement = document.createElement('a');
                aElement.href = emailContact.url;
                aElement.textContent = emailContact.url.replace('mailto:', '');
                printEmailContactDiv.appendChild(aElement);

            } else {
                printEmailContactDiv.innerHTML = '';
            }
        }

        // --- Populate the print-only languages list with full native names from languageNamesMap ---
        if (languagesPrintList) {
            languagesPrintList.innerHTML = ''; // Clear existing items
            availableLangs.forEach(langCode => {
                const li = document.createElement('li');
                // Use the native name from the map, fallback to uppercase code if not found
                let displayText = languageNamesMap[langCode] || langCode.toUpperCase();
                li.textContent = displayText;
                languagesPrintList.appendChild(li);
            });
        }
        // --- End populate print-only languages list ---


        leftColumn.innerHTML = '';
        rightColumn.innerHTML = '';

        data.sections.forEach(section => {
            const sectionElement = createSectionElement(section);
            if (sectionElement) {
                if (section.column === 'left') {
                    leftColumn.appendChild(sectionElement);
                } else if (section.column === 'right') {
                    rightColumn.appendChild(sectionElement);
                }
            }
        });

        // Find the languages section and populate its links dynamically for both display and switching
        const languagesSection = data.sections.find(sec => sec.type === 'languages');
        if (languagesSection && languagesSection.column === 'left') {
            const languageListUl = leftColumn.querySelector('#dynamicLanguageDisplayList');
            if (languageListUl) {
                languageListUl.innerHTML = '';

                availableLangs.forEach(langCode => {
                    const li = document.createElement('li');
                    li.className = 'language-list-item';
                    if (langCode === currentLang) {
                        li.classList.add('active');
                    }

                    // Display the full native language name from languageNamesMap
                    let displayText = languageNamesMap[langCode] || langCode.toUpperCase();
                    li.textContent = displayText; // No level/proficiency text appended
                    li.dataset.lang = langCode;
                    li.addEventListener('click', async function() {
                        if (currentLang !== langCode) {
                            currentLang = langCode;
                            const newData = await fetchCvData(currentLang);
                            if (newData) {
                                populateCV(newData);
                                updateActiveLanguageLink();
                            }
                        }
                    });
                    languageListUl.appendChild(li);
                });
            }
        }
    }


    // getLanguageDisplayName is now only a fallback if 'language' property is missing from JSON
    // or if the language code is not found in the initial discovery.
    function getLanguageDisplayName(langCode) {
        switch (langCode) {
            case 'en': return 'English';
            case 'sr': return 'Serbian';
            case 'sv': return 'Swedish';
            case 'fr': return 'French';
            case 'es': return 'Spanish';
            case 'de': return 'German';
            case 'it': return 'Italian';
            case 'ja': return 'Japanese';
            case 'ko': return 'Korean';
            case 'pt': return 'Portuguese';
            case 'ru': return 'Russian';
            case 'zh': return 'Chinese';
            default: return langCode.toUpperCase();
        }
    }

    function updateActiveLanguageLink() {
        document.querySelectorAll('.language-list-item').forEach(link => {
            if (link.dataset.lang === currentLang) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // --- Initial CV Load and Dynamic Language Discovery ---
    async function loadInitialCV() {
        const potentialLangs = ['en', 'sr', 'sv', 'fr', 'es', 'de', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'];
        const browserLang = navigator.language.split('-')[0];

        const fetchPromises = potentialLangs.map(async (langCode) => {
            const data = await fetchCvData(langCode);
            if (data) {
                // Find the language section in the fetched data
                const langSection = data.sections.find(sec => sec.type === 'languages');
                // Store the 'language' property from the 'current' object within the languages section
                // Check for langSection and langSection.current before accessing langSection.current.language
                if (langSection && langSection.current && langSection.current.language) {
                    languageNamesMap[langCode] = langSection.current.language;
                } else {
                    // Fallback to English name if 'language' property is missing from the 'current' object
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
            console.error("No CV data files found for any supported language.");
            showMessage("No CV data files found. Please ensure cvData_XX.json files are in the 'data' folder.", "error");
            return;
        }

        const data = await fetchCvData(currentLang);

        if (data) {
            try {
                populateCV(data);
            } catch (e) {
                console.error("Error populating CV:", e);
                showMessage("An error occurred while rendering the CV. Check console for details.", "error");
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

    // --- Call to load CV when DOM is ready ---
    loadInitialCV();

    // --- FAB Button Logic ---
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
            console.log("Print button clicked: Activating Print theme.");
            // Removed PDF theme deactivation
            if (printThemeStylesheet) {
                printThemeStylesheet.media = 'print';
                console.log("Print theme stylesheet media set to 'print'.");
            }

            window.print();

            setTimeout(() => {
                console.log("Resetting stylesheet media after print dialog.");
                // Removed PDF theme deactivation
                if (printThemeStylesheet) {
                    printThemeStylesheet.media = 'print'; // Keep print media for subsequent prints
                }
            }, 500);

            toggleFab();
        });
    }

    // Removed: if (fabSavePdfButton) { ... } block

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
