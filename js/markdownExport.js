/**
 * Converts a CV data object into Markdown formatted text.
 * This function processes the CV data and formats it as structured Markdown.
 * @param {object} data - The CV data object.
 * @param {string[]} [availableLangs=[]] - An array of available language codes.
 * @param {object} [languageNamesMap={}] - A map of language codes to display names.
 * @returns {string} The Markdown formatted string.
 */
function convertCvToMarkdown(data, availableLangs = [], languageNamesMap = {}) {
    let markdown = `# ${data.name}\n\n`;
    markdown += `## Summary\n\n${data.summary}\n\n`;


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

        markdown += `## ${section.title}\n\n`;

        if (section.type === 'list') {
            if (section.items && section.items.length > 0) {
                section.items.forEach(item => {
                    markdown += `- ${item}\n`;
                });
            }
            // Handle links in list sections (e.g., contact information)
            if (section.links && section.links.length > 0) {
                section.links.forEach(link => {
                    let url = link.url;
                    if (link.label.toLowerCase() === 'email' || link.label.toLowerCase() === 'e-mail') {
                        url = url.replace('mailto:', '');
                    }
                    markdown += `- [${link.label}](${url})\n`;
                });
            }
            markdown += `\n`;
        } else if (section.type === 'languages') {
            if (availableLangs && availableLangs.length > 0) {
                availableLangs.forEach(langCode => {
                    let displayText = languageNamesMap[langCode] || langCode.toUpperCase();
                    markdown += `- ${displayText}\n`;
                });
                markdown += `\n`;
            }
        } else if (section.type === 'entries') {
            section.items.forEach(item => {
                markdown += `#### ${item.title}\n`;

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
                    markdown += `${detailsLine}\n`;
                }

                if (item.date) {
                    markdown += `(${item.date})\n`;
                }

                markdown += `\n`;

                if (item.description) {
                    if (Array.isArray(item.description)) {
                        item.description.forEach(desc => {
                            markdown += `  - ${desc}\n`;
                        });
                    } else {
                        markdown += `${item.description}\n`;
                    }
                }
                markdown += `\n`;
            });
        } else if (section.type === 'text') {
            if (section.text) {
                markdown += `${section.text}\n\n`;
            }
        }
    });

    return markdown;
}

export { convertCvToMarkdown };
