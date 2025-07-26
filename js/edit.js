document.addEventListener('DOMContentLoaded', function() {
    let currentEditLang = 'en';
    // Object to hold all CV data for the current language
    let cvData = {};
    // Store all language data to manage tabs
    let allLanguages = [];

    // Editor DOM elements
    const cvEditForm = document.getElementById('cvEditForm');
    const nameInput = document.getElementById('name');
    const summaryTextarea = document.getElementById('summary');
    const hobbiesTextarea = document.getElementById('hobbiesText');
    const contactLinksContainer = document.getElementById('contactLinksContainer');
    const skillsContainer = document.getElementById('skillsContainer');
    const techStackContainer = document.getElementById('techStackContainer');
    const relevantEmploymentContainer = document.getElementById('relevantEmploymentContainer');
    const relevantEducationContainer = document.getElementById('relevantEducationContainer');
    const coursesContainer = document.getElementById('coursesContainer');
    const otherEmploymentContainer = document.getElementById('otherEmploymentContainer');
    const referencesContainer = document.getElementById('referencesContainer');
    const messageBox = document.getElementById('messageBox');

    // Language Tabs
    const languageTabsContainer = document.getElementById('languageTabs');
    const addLanguageTabBtn = document.getElementById('addLanguageTabBtn');

    // Custom Modal elements
    const customModal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalInput1 = document.getElementById('modalInput1');
    const modalInput2 = document.getElementById('modalInput2');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');

    let resolveModalPromise = null; // To hold the resolve function for the modal promise

    /**
     * Opens the custom modal.
     * @param {string} title - The title for the modal.
     * @param {string} message - The message for the modal.
     * @param {boolean} showInput1 - Whether to show the first input field.
     * @param {string} [placeholder1=''] - Placeholder for input1.
     * @param {boolean} showInput2 - Whether to show the second input field.
     * @param {string} [placeholder2=''] - Placeholder for input2.
     * @returns {Promise<Object|null>} - A promise that resolves with input values or null if cancelled.
     */
    function openCustomModal(title, message, showInput1 = false, placeholder1 = '', showInput2 = false, placeholder2 = '') {
        modalTitle.textContent = title;
        modalMessage.textContent = message;

        modalInput1.value = '';
        modalInput1.placeholder = placeholder1;
        modalInput1.classList.toggle('hidden', !showInput1);

        modalInput2.value = '';
        modalInput2.placeholder = placeholder2;
        modalInput2.classList.toggle('hidden', !showInput2);

        customModal.classList.add('active');

        return new Promise(resolve => {
            resolveModalPromise = resolve;
        });
    }

    /**
     * Closes the custom modal.
     */
    function closeCustomModal() {
        customModal.classList.remove('active');
        if (resolveModalPromise) {
            resolveModalPromise(null); // Resolve with null if closed without confirmation
            resolveModalPromise = null;
        }
    }

    // Modal button event listeners
    modalCancel.addEventListener('click', closeCustomModal);
    modalConfirm.addEventListener('click', () => {
        if (resolveModalPromise) {
            resolveModalPromise({
                input1: modalInput1.value.trim(),
                input2: modalInput2.value.trim()
            });
            resolveModalPromise = null;
        }
        customModal.classList.remove('active');
    });
    customModal.addEventListener('click', (event) => {
        if (event.target === customModal) {
            closeCustomModal();
        }
    });


    // Add item buttons
    document.getElementById('addContactLink').addEventListener('click', () => addContactLinkField());
    document.getElementById('addSkill').addEventListener('click', () => addSimpleInputField(skillsContainer, 'skills'));
    document.getElementById('addTechStack').addEventListener('click', () => addSimpleInputField(techStackContainer, 'techStack'));
    document.getElementById('addRelevantEmployment').addEventListener('click', () => addDetailedSectionEntry(relevantEmploymentContainer, 'job'));
    document.getElementById('addRelevantEducation').addEventListener('click', () => addDetailedSectionEntry(relevantEducationContainer, 'education'));
    document.getElementById('addCourse').addEventListener('click', () => addDetailedSectionEntry(coursesContainer, 'course'));
    document.getElementById('addOtherEmployment').addEventListener('click', () => addDetailedSectionEntry(otherEmploymentContainer, 'other-employment'));
    document.getElementById('addReference').addEventListener('click', () => addSimpleInputField(referencesContainer, 'references'));

    // Save button
    document.getElementById('saveCvData').addEventListener('click', saveCvData);

    /**
     * Displays a message box with a given message and type (success/error).
     * @param {string} message - The message to display.
     * @param {string} type - 'success' or 'error'.
     */
    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = 'message-box active'; // Reset classes
        if (type === 'error') {
            messageBox.classList.add('error');
        } else {
            messageBox.classList.remove('error');
        }
        setTimeout(() => {
            messageBox.classList.remove('active');
        }, 3000); // Hide after 3 seconds
    }

    /**
     * Fetches CV data for the given language.
     * @param {string} langCode - The language code (e.g., 'en', 'sr', 'sv').
     * @returns {Promise<Object>} - A promise that resolves with the CV data.
     */
    async function fetchCvData(langCode) {
        try {
            const response = await fetch(`../data/cvData_${langCode}.json`);
            if (!response.ok) {
                // If specific language not found, try to fetch English as fallback
                const fallbackResponse = await fetch('../data/cvData_en.json');
                if (!fallbackResponse.ok) {
                    throw new Error(`HTTP error! Status: ${fallbackResponse.status} for fallback English.`);
                }
                showMessage(`Data for ${langCode.toUpperCase()} not found. Loaded English data.`, 'error');
                return await fallbackResponse.json();
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching CV data for ${langCode}:`, error);
            showMessage(`Failed to load data for ${langCode}.`, 'error');
            return null;
        }
    }

    /**
     * Switches the language for editing and re-renders the form.
     * @param {string} langCode - The language code.
     */
    async function switchEditLanguage(langCode) {
        currentEditLang = langCode;
        // Update active state of language tabs
        renderLanguageTabs();

        cvData = await fetchCvData(langCode);
        if (cvData) {
            renderEditForm(cvData);
            showMessage(`Loaded CV data for ${langCode.toUpperCase()}.`, 'success');
        }
    }

    /**
     * Renders the language tabs based on allLanguages array.
     */
    function renderLanguageTabs() {
        languageTabsContainer.innerHTML = '';
        allLanguages.forEach(lang => {
            const button = document.createElement('button');
            button.classList.add('language-tab');
            button.setAttribute('data-lang', lang.code);
            button.textContent = lang.label;

            if (lang.code === currentEditLang) {
                button.classList.add('active');
            }

            button.addEventListener('click', () => switchEditLanguage(lang.code));

            // Add delete button to each tab except for the last one if it's the only one
            if (allLanguages.length > 1) {
                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-lang-btn');
                deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                deleteBtn.title = `Delete ${lang.label}`;
                deleteBtn.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevent tab switch when deleting
                    deleteLanguage(lang.code, lang.label);
                });
                button.appendChild(deleteBtn);
            }
            languageTabsContainer.appendChild(button);
        });
    }

    /**
     * Adds a new language to the available languages.
     */
    addLanguageTabBtn.addEventListener('click', async () => {
        const result = await openCustomModal(
            'Add New Language',
            'Enter the label (e.g., "French") and a unique code (e.g., "fr") for the new language.',
            true, 'Language Label', true, 'Language Code (e.g., en, sr, sv)'
        );

        if (result && result.input1 && result.input2) {
            const newLabel = result.input1;
            const newCode = result.input2.toLowerCase();

            if (allLanguages.some(lang => lang.code === newCode)) {
                showMessage(`Language code '${newCode}' already exists.`, 'error');
                return;
            }

            allLanguages.push({ label: newLabel, code: newCode });
            renderLanguageTabs();
            showMessage(`Language '${newLabel}' added to list. Remember to create 'cvData_${newCode}.json' manually!`, 'success');

            // Provide a template for the new language JSON file
            const templateData = JSON.parse(JSON.stringify(cvData)); // Deep copy current CV data
            templateData.name = `NEW NAME (${newLabel})`;
            templateData.summary = `This is a new summary for ${newLabel}. Please translate and fill in the data.`;
            templateData.sections.hobbies.text = `Hobbies for ${newLabel}.`;
            // You might want to clear or set placeholders for other sections too
            templateData.sections.relevantEmployment.items = [{ title: `New Job Title (${newLabel})`, company: "", employer: "", location: "", date: "", description: ["Add job description here."] }];
            templateData.sections.relevantEducation.items = [{ title: `New Education (${newLabel})`, school: "", description: ["Add education description here."] }];
            templateData.sections.courses.items = [{ title: `New Course (${newLabel})`, provider: "", description: "" }];
            templateData.sections.otherEmployment.items = [];
            templateData.sections.references.items = [];

            const dataStr = JSON.stringify(templateData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `cvData_${newCode}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showMessage(`'cvData_${newCode}.json' template downloaded. Please save it in your 'data' folder and translate its content.`, 'success');

        } else if (result !== null) {
            showMessage('Language not added. Both label and code are required.', 'error');
        }
    });

    /**
     * Deletes a language from the available languages.
     * @param {string} code - The language code to delete.
     * @param {string} label - The language label for confirmation message.
     */
    async function deleteLanguage(code, label) {
        if (allLanguages.length <= 1) {
            showMessage('Cannot delete the last remaining language.', 'error');
            return;
        }

        const confirmDelete = await openCustomModal(
            'Confirm Deletion',
            `Are you sure you want to delete the language "${label}"? This will remove it from the list. You will also need to manually delete the file 'cvData_${code}.json'.`,
            false, '', false, ''
        );

        if (confirmDelete) {
            allLanguages = allLanguages.filter(lang => lang.code !== code);
            renderLanguageTabs();
            showMessage(`Language "${label}" removed. Please manually delete 'cvData_${code}.json' from your 'data' folder.`, 'success');

            if (currentEditLang === code) {
                // Switch to English if the deleted language was active
                switchEditLanguage('en');
            }
        }
    }


    /**
     * Renders the entire editing form based on the loaded CV data.
     * @param {Object} data - The CV data object.
     */
    function renderEditForm(data) {
        // Clear previous content
        contactLinksContainer.innerHTML = '';
        skillsContainer.innerHTML = '';
        techStackContainer.innerHTML = '';
        relevantEmploymentContainer.innerHTML = '';
        relevantEducationContainer.innerHTML = '';
        coursesContainer.innerHTML = '';
        otherEmploymentContainer.innerHTML = '';
        referencesContainer.innerHTML = '';

        // Populate basic fields
        nameInput.value = data.name || '';
        summaryTextarea.value = data.summary || '';
        hobbiesTextarea.value = data.sections?.hobbies?.text || ''; // Added optional chaining

        // Populate contact links
        (data.contact || []).forEach(link => addContactLinkField(link)); // Ensure contact is an array

        // Populate simple lists
        (data.sections?.skills?.items || []).forEach(item => addSimpleInputField(skillsContainer, 'skills', item));
        (data.sections?.techStack?.items || []).forEach(item => addSimpleInputField(techStackContainer, 'techStack', item));
        (data.sections?.references?.items || []).forEach(item => addSimpleInputField(referencesContainer, 'references', item));

        // Populate detailed sections
        (data.sections?.relevantEmployment?.items || []).forEach(entry => addDetailedSectionEntry(relevantEmploymentContainer, 'job', entry));
        (data.sections?.relevantEducation?.items || []).forEach(entry => addDetailedSectionEntry(relevantEducationContainer, 'education', entry));
        (data.sections?.courses?.items || []).forEach(entry => addDetailedSectionEntry(coursesContainer, 'course', entry));
        (data.sections?.otherEmployment?.items || []).forEach(entry => addDetailedSectionEntry(otherEmploymentContainer, 'other-employment', entry));
    }

    /**
     * Adds input fields for a contact link.
     * @param {Object} [link={}] - Existing link data.
     */
    function addContactLinkField(link = {}) {
        const div = document.createElement('div');
        div.classList.add('dynamic-item', 'flex-col', 'md:flex-row', 'md:items-end', 'w-full', 'border-b', 'pb-2', 'mb-2'); // Smaller padding/margin
        div.innerHTML = `
            <div class="input-group flex-1 w-full md:w-auto">
                <label>Label</label>
                <input type="text" class="contact-label" value="${link.label || ''}" placeholder="e.g., Mobile, Email">
            </div>
            <div class="input-group flex-1 w-full md:w-auto">
                <label>URL</label>
                <input type="text" class="contact-url" value="${link.url || ''}" placeholder="e.g., tel:+123, mailto:abc@xyz.com">
            </div>
            <div class="input-group flex-1 w-full md:w-auto">
                <label>Icon Class</label>
                <input type="text" class="contact-icon" value="${link.icon || ''}" placeholder="e.g., fa-solid fa-phone">
            </div>
            <button type="button" class="btn btn-danger btn-small remove-item-btn"><i class="fas fa-trash"></i></button>
        `;
        contactLinksContainer.appendChild(div);
        div.querySelector('.remove-item-btn').addEventListener('click', () => div.remove());
    }

    /**
     * Adds a simple input field for lists like skills, tech stack, references.
     * @param {HTMLElement} container - The container element for the list.
     * @param {string} sectionKey - The key in the JSON data (e.g., 'skills').
     * @param {string} [value=''] - Existing item value.
     */
    function addSimpleInputField(container, sectionKey, value = '') {
        const div = document.createElement('div');
        div.classList.add('dynamic-item', 'w-full');
        div.innerHTML = `
            <input type="text" class="${sectionKey}-item" value="${value}" placeholder="Add new ${sectionKey.slice(0, -1)}">
            <button type="button" class="btn btn-danger btn-small remove-item-btn"><i class="fas fa-trash"></i></button>
        `;
        container.appendChild(div);
        div.querySelector('.remove-item-btn').addEventListener('click', () => div.remove());
    }

    /**
     * Adds a detailed section entry (employment, education, course, other employment).
     * @param {HTMLElement} container - The container element for the section.
     * @param {string} type - The type of entry ('job', 'education', 'course', 'other-employment').
     * @param {Object} [entry={}] - Existing entry data.
     */
    function addDetailedSectionEntry(container, type, entry = {}) {
        const div = document.createElement('div');
        div.classList.add('dynamic-section-item');
        let html = '';

        if (type === 'job' || type === 'other-employment') {
            html = `
                <button type="button" class="btn btn-danger btn-small remove-item-btn"><i class="fas fa-trash"></i></button>
                <div class="input-group">
                    <label>Title</label>
                    <input type="text" class="${type}-title" value="${entry.title || ''}" placeholder="e.g., Software Engineer">
                </div>
                <div class="input-group">
                    <label>Company</label>
                    <input type="text" class="${type}-company" value="${entry.company || ''}" placeholder="e.g., Google">
                </div>
                <div class="input-group">
                    <label>Employer (Optional)</label>
                    <input type="text" class="${type}-employer" value="${entry.employer || ''}" placeholder="e.g., External Agency">
                </div>
                <div class="input-group">
                    <label>Location</label>
                    <input type="text" class="${type}-location" value="${entry.location || ''}" placeholder="e.g., City, Country">
                </div>
                <div class="input-group">
                    <label>Date Range</label>
                    <input type="text" class="${type}-date" value="${entry.date || ''}" placeholder="e.g., Jan 2020 - Dec 2022">
                </div>
                <div class="input-group">
                    <label>Description (separate points with newlines)</label>
                    <textarea class="${type}-description" rows="3" placeholder="Key responsibilities or achievements">${Array.isArray(entry.description) ? entry.description.join('\n') : entry.description || ''}</textarea>
                </div>
            `;
        } else if (type === 'education') {
            html = `
                <button type="button" class="btn btn-danger btn-small remove-item-btn"><i class="fas fa-trash"></i></button>
                <div class="input-group">
                    <label>Degree/Title</label>
                    <input type="text" class="${type}-title" value="${entry.title || ''}" placeholder="e.g., IT Engineer">
                </div>
                <div class="input-group">
                    <label>School/University</label>
                    <input type="text" class="${type}-school" value="${entry.school || ''}" placeholder="e.g., Metropolitan University">
                </div>
                <div class="input-group">
                    <label>Description (separate points with newlines)</label>
                    <textarea class="${type}-description" rows="3" placeholder="Key achievements or focus areas">${Array.isArray(entry.description) ? entry.description.join('\n') : entry.description || ''}</textarea>
                </div>
            `;
        } else if (type === 'course') {
            html = `
                <button type="button" class="btn btn-danger btn-small remove-item-btn"><i class="fas fa-trash"></i></button>
                <div class="input-group">
                    <label>Course Title</label>
                    <input type="text" class="${type}-title" value="${entry.title || ''}" placeholder="e.g., The Ultimate React Native Series">
                </div>
                <div class="input-group">
                    <label>Provider</label>
                    <input type="text" class="${type}-provider" value="${entry.provider || ''}" placeholder="e.g., Code With Mosh">
                </div>
                <div class="input-group">
                    <label>Description</label>
                    <textarea class="${type}-description" rows="2" placeholder="Brief description of the course">${entry.description || ''}</textarea>
                </div>
            `;
        }

        div.innerHTML = html;
        container.appendChild(div);
        div.querySelector('.remove-item-btn').addEventListener('click', () => div.remove());
    }

    /**
     * Collects all data from the form and constructs a new CV data object.
     * @returns {Object} - The collected CV data object.
     */
    function collectFormData() {
        // Start with a deep copy of the original structure to retain titles and other fixed properties
        const newCvData = JSON.parse(JSON.stringify(cvData));

        newCvData.name = nameInput.value.trim();
        newCvData.summary = summaryTextarea.value.trim();
        newCvData.sections.hobbies.text = hobbiesTextarea.value.trim();

        // Contact Links
        newCvData.contact = Array.from(contactLinksContainer.children).map(div => ({
            label: div.querySelector('.contact-label').value.trim(),
            url: div.querySelector('.contact-url').value.trim(),
            icon: div.querySelector('.contact-icon').value.trim()
        })).filter(item => item.label && item.url); // Filter out empty entries

        // Simple Lists (Skills, Tech Stack, References)
        newCvData.sections.skills.items = Array.from(skillsContainer.children).map(div =>
            div.querySelector('.skills-item').value.trim()
        ).filter(item => item);

        newCvData.sections.techStack.items = Array.from(techStackContainer.children).map(div =>
            div.querySelector('.techStack-item').value.trim()
        ).filter(item => item);

        newCvData.sections.references.items = Array.from(referencesContainer.children).map(div =>
            div.querySelector('.references-item').value.trim()
        ).filter(item => item);

        // Detailed Sections
        newCvData.sections.relevantEmployment.items = Array.from(relevantEmploymentContainer.children).map(div => ({
            title: div.querySelector('.job-title').value.trim(),
            company: div.querySelector('.job-company').value.trim(),
            employer: div.querySelector('.job-employer').value.trim(),
            location: div.querySelector('.job-location').value.trim(),
            date: div.querySelector('.job-date').value.trim(),
            description: div.querySelector('.job-description').value.trim().split('\n').map(s => s.trim()).filter(s => s)
        }));

        newCvData.sections.relevantEducation.items = Array.from(relevantEducationContainer.children).map(div => ({
            title: div.querySelector('.education-title').value.trim(),
            school: div.querySelector('.education-school').value.trim(),
            description: div.querySelector('.education-description').value.trim().split('\n').map(s => s.trim()).filter(s => s)
        }));

        newCvData.sections.courses.items = Array.from(coursesContainer.children).map(div => ({
            title: div.querySelector('.course-title').value.trim(),
            provider: div.querySelector('.course-provider').value.trim(),
            description: div.querySelector('.course-description').value.trim()
        }));

        newCvData.sections.otherEmployment.items = Array.from(otherEmploymentContainer.children).map(div => ({
            title: div.querySelector('.other-employment-title').value.trim(),
            company: div.querySelector('.other-employment-company').value.trim(),
            employer: div.querySelector('.other-employment-employer').value.trim(),
            location: div.querySelector('.other-employment-location').value.trim(),
            date: div.querySelector('.other-employment-date').value.trim()
        }));

        return newCvData;
    }

    /**
     * Saves the current CV data by initiating a download of the JSON file.
     */
    function saveCvData() {
        const updatedData = collectFormData();
        const dataStr = JSON.stringify(updatedData, null, 2); // Pretty print JSON

        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `cvData_${currentEditLang}.json`; // Suggest filename based on current language
        document.body.appendChild(a); // Append to body to make it clickable
        a.click(); // Programmatically click the link to trigger download
        document.body.removeChild(a); // Clean up
        URL.revokeObjectURL(url); // Release the object URL

        showMessage('CV data downloaded successfully! Replace the existing file in your data folder.', 'success');
    }

    /**
     * Initializes the editor by fetching all language data and rendering the first language.
     */
    async function initializeEditor() {
        // Fetch all language data to populate tabs
        const langCodes = ['en', 'sr', 'sv']; // Assuming these are your initial languages
        for (const code of langCodes) {
            const data = await fetchCvData(code);
            if (data && data.sections && data.sections.languages && data.sections.languages.items) {
                const langItem = data.sections.languages.items.find(item => item.code === code);
                if (langItem) {
                    allLanguages.push(langItem);
                }
            }
        }
        // If no languages found, add English as a fallback
        if (allLanguages.length === 0) {
            allLanguages.push({ label: 'English', code: 'en' });
            showMessage('No language data found. Defaulting to English. You may need to create cvData_en.json.', 'error');
        }

        // Sort languages by label for consistent display
        allLanguages.sort((a, b) => a.label.localeCompare(b.label));

        // Set initial language to browser's language if available, else English
        const browserLang = navigator.language.split('-')[0];
        const initialLang = allLanguages.find(lang => lang.code === browserLang) ? browserLang : 'en';

        switchEditLanguage(initialLang);
    }

    // Initialize the editor on page load
    if (cvEditForm) { // Only initialize editor logic if on the edit page
        initializeEditor();
    }
});
