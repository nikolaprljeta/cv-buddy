/**
 * Creates a DOM element for a CV section based on the section data.
 * @param {object} section - The section data object containing type, title, items, etc.
 * @returns {HTMLElement|null} The created section element or null if no content.
 */
function createSectionElement(section) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = `section-item ${section.type}-section`;

    // Check if section has content to render
    let hasContent = false;
    if (section.type === 'list' || section.type === 'entries') {
        hasContent = (section.items && section.items.length > 0) || (section.links && section.links.length > 0);
    } else if (section.title && section.title.toLowerCase().includes('lang')) {
        hasContent = true;
    } else if (section.type === 'text') {
        hasContent = section.text;
    }

    // Debug logging for references section
    if (section.title && section.title.includes('REFERENCES')) {
        console.log('🔍 REFERENCES section debug:', {
            title: section.title,
            type: section.type,
            hasItems: !!(section.items && section.items.length > 0),
            hasLinks: !!(section.links && section.links.length > 0),
            hasContent: hasContent,
            items: section.items
        });
    }

    if (!hasContent) {
        if (section.title && section.title.includes('REFERENCES')) {
            console.error('❌ REFERENCES section has no content, returning null!');
        }
        return null;
    }

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
        
        // Render regular items
        const items = section.items || [];
        items.forEach(item => {
            ul.appendChild(renderListItem(item));
        });
        
        // Render links
        const links = section.links || [];
        links.forEach(link => {
            ul.appendChild(renderLinkItem(link));
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

/**
 * Helper function to render a list item element.
 * Creates clickable links if URL is present, otherwise renders plain text.
 * @param {string|object} item - The item data (string or object with text/url properties).
 * @returns {HTMLElement} The created list item element.
 */
function renderListItem(item) {
    const li = document.createElement('li');
    li.className = 'list-item';
    if (typeof item === 'object' && item !== null && item.text) {
        if (item.url) {
            const a = document.createElement('a');
            a.className = 'list-link';
            a.textContent = item.text;
            a.href = item.url;
            a.target = '_blank';
            li.appendChild(a);
        } else {
            li.textContent = item.text;
        }
    } else {
        li.textContent = item;
    }
    return li;
}

/**
 * Helper function to render a link item element from contact links.
 * Creates clickable links with icons for contact information.
 * @param {object} link - The link data object with label, url, and optional icon properties.
 * @returns {HTMLElement} The created list item element.
 */
function renderLinkItem(link) {
    const li = document.createElement('li');
    li.className = 'list-item';
    
    if (link.url) {
        const a = document.createElement('a');
        a.className = 'list-link';
        a.href = link.url;
        a.target = '_blank';
        
        // Add icon if present
        if (link.icon) {
            const icon = document.createElement('i');
            icon.className = link.icon;
            a.appendChild(icon);
            a.appendChild(document.createTextNode(' '));
        }
        
        // Add label text
        a.appendChild(document.createTextNode(link.label || link.url));
        li.appendChild(a);
    } else {
        // Fallback for links without URL
        if (link.icon) {
            const icon = document.createElement('i');
            icon.className = link.icon;
            li.appendChild(icon);
            li.appendChild(document.createTextNode(' '));
        }
        li.appendChild(document.createTextNode(link.label || ''));
    }
    
    return li;
}

export { createSectionElement };
