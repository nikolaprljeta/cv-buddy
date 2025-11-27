/**
 * Converts a CV data object into a plain text string.
 * This function handles the different section types and formats them into a readable text format.
 * @param {object} data - The CV data object.
 * @param {string[]} availableLangs - An array of available language codes.
 * @param {object} languageNamesMap - A map of language codes to display names.
 * @returns {string} The plain text formatted string.
 */
function convertCvToText(data, availableLangs = [], languageNamesMap = {}) {
    let text = `${data.name}\n\n`;
    text += `Summary:\n${data.summary}\n\n`;


    data.sections.forEach(section => {
        let hasContent = false;
        if (section.type === 'list' || section.type === 'entries') {
            hasContent = (section.items && section.items.length > 0) || (section.links && section.links.length > 0);
        } else if (section.type === 'languages') {
            hasContent = availableLangs && availableLangs.length > 0;
        } else if (section.type === 'text') {
            hasContent = section.text;
        }

        if (!hasContent) return;

        text += `${section.title.toUpperCase()}\n\n`;

        if (section.type === 'list') {
            if (section.items && section.items.length > 0) {
                section.items.forEach(item => {
                    text += `- ${item}\n`;
                });
            }
            // Handle links in list sections (e.g., contact information)
            if (section.links && section.links.length > 0) {
                section.links.forEach(link => {
                    let url = link.url;
                    // For emails, display only the email address without the 'mailto:' prefix
                    if (link.label.toLowerCase() === 'email' || link.label.toLowerCase() === 'e-mail') {
                        url = url.replace('mailto:', '');
                        text += `- ${link.label}: ${url}\n`;
                    } else {
                        text += `- ${link.label}: ${url}\n`;
                    }
                });
            }
            text += `\n`;
        } else if (section.type === 'languages') {
            if (availableLangs && availableLangs.length > 0) {
                text += `Available languages: ${availableLangs.map(lang => languageNamesMap[lang] || lang.toUpperCase()).join(', ')}\n\n`;
            }
        } else if (section.type === 'entries') {
            section.items.forEach(item => {
                text += `${item.title}\n`;

                let detailsLine = '';
                if (item.company || item.institution) {
                    detailsLine += item.company || item.institution;
                }
                if (item.location) {
                    if (detailsLine) detailsLine += ', ';
                    detailsLine += item.location;
                }
                if (detailsLine) {
                    text += `${detailsLine}\n`;
                }

                if (item.date) {
                    text += `(${item.date})\n`;
                }

                text += `\n`;

                if (item.description) {
                    if (Array.isArray(item.description)) {
                        item.description.forEach(desc => {
                            text += `  - ${desc}\n`;
                        });
                    } else {
                        text += `${item.description}\n`;
                    }
                }
                text += `\n`;
            });
        } else if (section.type === 'text') {
            if (section.text) {
                text += `${section.text}\n\n`;
            }
        }
    });

    return text;
}

export { convertCvToText };
