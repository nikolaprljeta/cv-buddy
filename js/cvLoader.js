/**
 * Fetches CV data for a specific language.
 * @param {string} lang - The language code (e.g., 'en', 'sr', 'sv').
 * @returns {Promise<object|null>} The CV data object or null if not found.
 */
export function fetchCvData(lang) {
    return fetch(`../data/cvData_${lang}.json`)
        .then(response => {
            if (!response.ok) {
                return null;
            }
            return response.json();
        })
        .catch(error => {
            return null;
        });
}

