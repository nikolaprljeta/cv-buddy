function createSectionElement(section) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = `section-item ${section.type}-section`;

    // Always render the LANGUAGES section so the language list can be injected
    let hasContent = false;
    if (section.type === 'list' || section.type === 'entries') {
        hasContent = section.items && section.items.length > 0;
    } else if (section.title && section.title.toLowerCase().includes('lang')) {
        hasContent = true;
    } else if (section.type === 'text') {
        hasContent = section.text;
    }

    if (!hasContent) return null;

    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = section.title;
    sectionDiv.appendChild(title);

    // For the LANGUAGES section, add a visible placeholder for the language list
    if (section.title && section.title.toLowerCase().includes('lang')) {
        const langListPlaceholder = document.createElement('ul');
        langListPlaceholder.id = 'dynamicLanguageDisplayList';
        langListPlaceholder.className = 'language-links-list';
        sectionDiv.appendChild(langListPlaceholder);
    } else if (section.type === 'list') {
        const ul = document.createElement('ul');
        ul.className = 'bullet-list';
        const items = section.items || [];
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'list-item';
            if (item && typeof item === 'object' && (item.url || item.link)) {
                const a = document.createElement('a');
                a.href = item.url || item.link;
                a.textContent = item.label || item.text || item.name || item.title || item.url || item.link;
                a.className = 'list-link';
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                li.appendChild(a);
            } else {
                li.textContent = typeof item === 'string' ? item : String(item);
            }
            ul.appendChild(li);
        });
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
                        li.className = 'language-list-item';
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

export { createSectionElement };
