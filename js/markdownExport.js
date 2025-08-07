function convertCvToMarkdown(data, availableLangs = [], languageNamesMap = {}) {
    let markdown = `# ${data.name}\n\n`;
    markdown += `## Summary\n\n${data.summary}\n\n`;

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

    data.sections.forEach(section => {
        let hasContent = false;
        if (section.type === 'list' || section.type === 'entries') {
            hasContent = section.items && section.items.length > 0;
        } else if (section.type === 'languages') {
            hasContent = availableLangs && availableLangs.length > 0;
        } else if (section.type === 'text') {
            hasContent = section.text;
        }

        if (!hasContent) return;

        markdown += `## ${section.title}\n\n`;

        if (section.type === 'list') {
            section.items.forEach(item => {
                markdown += `- ${item}\n`;
            });
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
