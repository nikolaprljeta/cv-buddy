document.addEventListener('DOMContentLoaded', function() {
    let currentLang = 'en'; // Default language

    // DOM elements for CV display
    const profileImage = document.getElementById('profileImage');
    const profileImageModal = document.getElementById('profileImageModal');
    const enlargedProfileImage = document.getElementById('enlargedProfileImage');

    // FAB elements (these are on cv.html)
    const fabContainer = document.querySelector('.fab-container');
    const fabMainButton = document.getElementById('fabMainButton');
    const fabPrintButton = document.getElementById('fabPrintButton');
    const fabEditButton = document.getElementById('fabEditButton');
    const fabUploadCvDataButton = document.getElementById('fabUploadCvDataButton'); // New upload button
    const cvFileInput = document.getElementById('cvFileInput'); // Hidden file input

    // Modal for profile image
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
        profileImageModal.addEventListener('click', function(event) {
            if (event.target === profileImageModal) {
                closeModal();
            }
        });
    }

    /**
     * Renders a simple bullet list.
     * @param {Array} items - Array of strings.
     * @param {string} elementId - ID of the UL element.
     */
    function renderList(items, elementId) {
        const ul = document.getElementById(elementId);
        if (ul && Array.isArray(items)) {
            ul.innerHTML = '';
            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                ul.appendChild(li);
            });
        } else if (ul) {
            ul.innerHTML = ''; // Clear if data is not an array or missing
        }
    }

    /**
     * Renders language selection buttons within the content.
     * @param {Array} languages - Array of language objects {label, code}.
     * @param {string} elementId - ID of the container element.
     */
    function renderInContentLanguageButtons(languages, elementId) {
        const container = document.getElementById(elementId);
        if (container && Array.isArray(languages)) {
            container.innerHTML = '';
            languages.forEach(lang => {
                const li = document.createElement('li');
                const button = document.createElement('button');
                button.textContent = lang.label;
                button.setAttribute('data-lang', lang.code);
                button.classList.add('language-button', 'in-content-language-button');
                if (lang.code === currentLang) {
                    button.classList.add('active');
                }
                button.addEventListener('click', function() {
                    const clickedLang = this.getAttribute('data-lang');
                    switchLanguage(clickedLang);
                });
                li.appendChild(button);
                container.appendChild(li);
            });
        } else if (container) {
            container.innerHTML = '';
        }
    }

    /**
     * Renders language list for print view.
     * @param {Array} languages - Array of language objects {label, code}.
     * @param {string} elementId - ID of the UL element.
     */
    function renderLanguagePrintList(languages, elementId) {
        const ul = document.getElementById(elementId);
        if (ul && Array.isArray(languages)) {
            ul.innerHTML = '';
            languages.forEach(lang => {
                const li = document.createElement('li');
                li.classList.add('print-only-language-label');
                li.innerHTML = `${lang.label}`;
                ul.appendChild(li);
            });
        } else if (ul) {
            ul.innerHTML = '';
        }
    }

    /**
     * Renders detailed sections like employment, education, courses.
     * @param {Array} items - Array of detailed entry objects.
     * @param {string} elementId - ID of the container element.
     * @param {string} type - Type of section ('job', 'education', 'course', 'other-employment').
     */
    function renderDetailedSection(items, elementId, type) {
        const container = document.getElementById(elementId);
        if (container && Array.isArray(items)) {
            container.innerHTML = '';
            items.forEach(item => {
                const entryDiv = document.createElement('div');
                entryDiv.classList.add(`${type}-entry`);

                let titleHtml = '';
                if (type === 'job' || type === 'other-employment') {
                    titleHtml = `<h3 class="${type}-title">${item.title || ''}</h3>`;
                    if (item.company) {
                        titleHtml += `<p class="employer-school">${item.company} ${item.employer ? `(${item.employer})` : ''}</p>`;
                    } else if (item.employer) {
                        titleHtml += `<p class="employer-school">${item.employer}</p>`;
                    }
                } else if (type === 'education') {
                    titleHtml = `<h3 class="${type}-degree">${item.title || ''}</h3>`;
                    if (item.school) {
                        titleHtml += `<p class="employer-school">${item.school}</p>`;
                    }
                } else if (type === 'course') {
                    titleHtml = `<h3 class="${type}-title">${item.title || ''}</h3>`;
                    if (item.provider) {
                        titleHtml += `<p class="course-provider">${item.provider}</p>`;
                    }
                }
                entryDiv.innerHTML += titleHtml;

                if (item.location) {
                    entryDiv.innerHTML += `<p class="employer-location">${item.location}</p>`;
                }
                if (item.date) {
                    entryDiv.innerHTML += `<p class="date-range">${item.date}</p>`;
                }

                if (item.description) {
                    const descriptionDiv = document.createElement('div');
                    descriptionDiv.classList.add(`${type}-description`);
                    if (Array.isArray(item.description)) {
                        const ul = document.createElement('ul');
                        item.description.forEach(descPoint => {
                            const li = document.createElement('li');
                            li.textContent = descPoint;
                            ul.appendChild(li);
                        });
                        descriptionDiv.appendChild(ul);
                    } else {
                        const p = document.createElement('p');
                        p.textContent = item.description;
                        descriptionDiv.appendChild(p);
                    }
                    entryDiv.appendChild(descriptionDiv);
                }
                container.appendChild(entryDiv);
            });
        } else if (container) {
            container.innerHTML = ''; // Clear if data is not an array or missing
        }
    }

    /**
     * Formats a phone number string.
     * @param {string} numberString - The raw phone number string.
     * @returns {string} - Formatted phone number.
     */
    function formatPhoneNumber(numberString) {
        const cleaned = numberString.replace(/\D/g, '');
        if (cleaned.startsWith('381') && cleaned.length >= 11) { // Basic check for Serbian numbers
            return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
        }
        return numberString;
    }

    /**
     * Populates the CV content based on the provided data.
     * Added more robust checks for nested properties.
     * @param {Object} data - The CV data object.
     */
    function populateCV(data) {
        // Ensure data and its top-level properties exist
        document.getElementById('name').textContent = data.name || '';
        document.getElementById('summary').textContent = data.summary || '';

        const printSummaryElement = document.getElementById('printSummary');
        if (printSummaryElement) {
            printSummaryElement.innerHTML = `<p>${data.summary || ''}</p>`;
        }

        const printPhoneNumberElement = document.getElementById('printPhoneNumber');
        const printEmailElement = document.getElementById('printEmail');
        if (printPhoneNumberElement && printEmailElement && data.contact) {
            const phoneNumber = data.contact.find(link => link.url && link.url.startsWith('tel:'));
            const email = data.contact.find(link => link.url && link.url.startsWith('mailto:'));
            printPhoneNumberElement.textContent = phoneNumber ? formatPhoneNumber(phoneNumber.url.replace('tel:', '')) : '';
            printEmailElement.textContent = email ? email.url.replace('mailto:', '') : '';
        } else if (printPhoneNumberElement && printEmailElement) {
            printPhoneNumberElement.textContent = '';
            printEmailElement.textContent = '';
        }

        const contactLinksContainer = document.getElementById('contactLinks');
        if (contactLinksContainer && data.contact) {
            contactLinksContainer.innerHTML = '';
            data.contact.forEach(link => {
                if (link.url && link.icon && link.label) {
                    const a = document.createElement('a');
                    a.href = link.url;
                    a.target = "_blank";
                    a.rel = "noopener noreferrer";
                    const icon = document.createElement('i');
                    icon.classList.add(...link.icon.split(' '));
                    a.appendChild(icon);
                    const labelSpan = document.createElement('span');
                    labelSpan.classList.add('contact-label');
                    labelSpan.textContent = link.label;
                    a.appendChild(labelSpan);
                    if (link.url.startsWith('tel:')) {
                        a.setAttribute('data-value', link.url.replace('tel:', ''));
                    } else if (link.url.startsWith('mailto:')) {
                        a.setAttribute('data-value', link.url.replace('mailto:', ''));
                    }
                    contactLinksContainer.appendChild(a);
                }
            });
        } else if (contactLinksContainer) {
            contactLinksContainer.innerHTML = '';
        }

        // Safely access nested properties using optional chaining or logical AND
        document.getElementById('skillsTitle').textContent = data.sections?.skills?.title || '';
        renderList(data.sections?.skills?.items || [], 'skillsList');

        document.getElementById('languagesTitle').textContent = data.sections?.languages?.title || '';
        renderInContentLanguageButtons(data.sections?.languages?.items || [], 'languagesList');
        renderLanguagePrintList(data.sections?.languages?.items || [], 'languagesPrintList');

        document.getElementById('hobbiesTitle').textContent = data.sections?.hobbies?.title || '';
        const hobbiesTextElement = document.getElementById('hobbiesText');
        if (hobbiesTextElement) {
            hobbiesTextElement.innerHTML = `<p>${data.sections?.hobbies?.text || ''}</p>`;
        }

        document.getElementById('relevantEmploymentTitle').textContent = data.sections?.relevantEmployment?.title || '';
        renderDetailedSection(data.sections?.relevantEmployment?.items || [], 'relevantEmployment', 'job');

        document.getElementById('relevantEducationTitle').textContent = data.sections?.relevantEducation?.title || '';
        renderDetailedSection(data.sections?.relevantEducation?.items || [], 'relevantEducation', 'education');

        document.getElementById('coursesTitle').textContent = data.sections?.courses?.title || '';
        renderDetailedSection(data.sections?.courses?.items || [], 'coursesList', 'course');

        document.getElementById('referencesTitle').textContent = data.sections?.references?.title || '';
        renderList(data.sections?.references?.items || [], 'referencesList');

        document.getElementById('otherEmploymentTitle').textContent = data.sections?.otherEmployment?.title || '';
        renderDetailedSection(data.sections?.otherEmployment?.items || [], 'otherEmployment', 'other-employment');
    }

    /**
     * Switches the displayed language.
     * @param {string} langCode - The language code to switch to.
     */
    async function switchLanguage(langCode) {
        currentLang = langCode;
        const dataFilePath = `../data/cvData_${langCode}.json`;

        try {
            const response = await fetch(dataFilePath);
            let data;
            if (response.ok) {
                data = await response.json();
            } else {
                // Fallback to English if the requested language file is not found
                const fallbackResponse = await fetch('../data/cvData_en.json');
                if (!fallbackResponse.ok) {
                    throw new Error(`Failed to load English fallback data: ${fallbackResponse.status}`);
                }
                data = await fallbackResponse.json();
                console.warn(`Data for ${langCode} not found. Loaded English data instead.`);
            }
            populateCV(data);
            // Update active state of language buttons
            document.querySelectorAll('.in-content-language-button').forEach(button => {
                button.classList.remove('active');
                if (button.getAttribute('data-lang') === currentLang) {
                    button.classList.add('active');
                }
            });
        } catch (error) {
            console.error(`Error during CV data fetch or population for ${langCode}:`, error);
            // Optionally, clear the CV or show a user-friendly error message on the page
            populateCV({}); // Populate with an empty object to clear the CV
        }
    }

    // Initial load based on browser language or default to English
    const browserLang = navigator.language.split('-')[0];
    switchLanguage(browserLang); // This will handle fallback to 'en' if browserLang is not found

    // FAB Logic
    if (fabMainButton) {
        fabMainButton.addEventListener('click', () => {
            fabContainer.classList.toggle('expanded');
        });
    }

    if (fabPrintButton) {
        fabPrintButton.addEventListener('click', () => {
            window.print();
            if (fabContainer) {
                fabContainer.classList.remove('expanded'); // Collapse after action
            }
        });
    }

    if (fabEditButton) {
        fabEditButton.addEventListener('click', () => {
            if (fabContainer) {
                fabContainer.classList.remove('expanded');
            }
        });
    }

    // Upload CV Data Logic
    if (fabUploadCvDataButton && cvFileInput) {
        fabUploadCvDataButton.addEventListener('click', () => {
            cvFileInput.click(); // Trigger the hidden file input click
            if (fabContainer) {
                fabContainer.classList.remove('expanded'); // Collapse after action
            }
        });

        cvFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const uploadedData = JSON.parse(e.target.result);
                        populateCV(uploadedData);
                        // Attempt to determine language from filename if possible, or set to 'uploaded'
                        const fileName = file.name;
                        const langMatch = fileName.match(/cvData_([a-z]{2})\.json/i);
                        currentLang = langMatch ? langMatch[1].toLowerCase() : 'uploaded';
                        console.log(`CV data uploaded successfully. Current language set to: ${currentLang}`);
                    } catch (error) {
                        console.error("Error parsing uploaded JSON file:", error);
                        alert("Error: Could not read the uploaded file. Please ensure it is a valid JSON file.");
                    }
                };
                reader.onerror = (e) => {
                    console.error("Error reading file:", e);
                    alert("Error reading file. Please try again.");
                };
                reader.readAsText(file);
            }
        });
    }
});
