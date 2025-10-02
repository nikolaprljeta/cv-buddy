/**
 * Converts a CV data object into a CSV formatted string.
 * This function processes the nested CV data and flattens it into a structured CSV format.
 * @param {object} data - The CV data object.
 * @param {string[]} availableLangs - An array of available language codes.
 * @param {object} languageNamesMap - A map of language codes to display names.
 * @returns {string} The CSV formatted string.
 */
function convertCvToCsv(data, availableLangs = [], languageNamesMap = {}) {
    // Helper function to escape data for CSV
    const escapeCsv = (value) => {
        if (value === null || value === undefined) {
            return '';
        }
        let str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    let csv = '';

    // Header section
    csv += `Section,Sub-Section,Detail,Value\n`;

    // Name and Summary
    csv += `"Header",,"Name",${escapeCsv(data.name)}\n`;
    csv += `"Header",,"Summary",${escapeCsv(data.summary)}\n`;


    // Sections
    if (data.sections && data.sections.length > 0) {
        data.sections.forEach(section => {
            if (section.type === 'list' && section.items && section.items.length > 0) {
                section.items.forEach(item => {
                    csv += `${escapeCsv(section.title)},"Item",,"${escapeCsv(item)}"\n`;
                });
            }
            // Handle links in list sections (e.g., contact information)
            if (section.type === 'list' && section.links && section.links.length > 0) {
                section.links.forEach(link => {
                    csv += `${escapeCsv(section.title)},${escapeCsv(link.label)},"URL",${escapeCsv(link.url)}\n`;
                });
            }
            if (section.type === 'languages' && availableLangs && availableLangs.length > 0) {
                const languageList = availableLangs.map(lang => languageNamesMap[lang] || lang.toUpperCase()).join('; ');
                csv += `${escapeCsv(section.title)},"Available Languages",,"${escapeCsv(languageList)}"\n`;
            } else if (section.type === 'entries' && section.items && section.items.length > 0) {
                section.items.forEach(item => {
                    csv += `${escapeCsv(section.title)},"Entry Title",,"${escapeCsv(item.title)}"\n`;
                    if (item.company) {
                        csv += `${escapeCsv(section.title)},"Company",,"${escapeCsv(item.company)}"\n`;
                    }
                    if (item.institution) {
                        csv += `${escapeCsv(section.title)},"Institution",,"${escapeCsv(item.institution)}"\n`;
                    }
                    if (item.location) {
                        csv += `${escapeCsv(section.title)},"Location",,"${escapeCsv(item.location)}"\n`;
                    }
                    if (item.date) {
                        csv += `${escapeCsv(section.title)},"Date",,"${escapeCsv(item.date)}"\n`;
                    }
                    if (item.description) {
                        if (Array.isArray(item.description)) {
                            item.description.forEach(desc => {
                                csv += `${escapeCsv(section.title)},"Description",,"${escapeCsv(desc)}"\n`;
                            });
                        } else {
                            csv += `${escapeCsv(section.title)},"Description",,"${escapeCsv(item.description)}"\n`;
                        }
                    }
                });
            } else if (section.type === 'text' && section.text) {
                csv += `${escapeCsv(section.title)},"Text",,"${escapeCsv(section.text)}"\n`;
            }
        });
    }

    return csv;
}

export { convertCvToCsv };
