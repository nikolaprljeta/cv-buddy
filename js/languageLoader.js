/**
 * Loads available languages by testing which language data files exist.
 * Tests each potential language file to determine which ones are available.
 * @returns {Promise<string[]>} Array of available language codes.
 */
export async function getAvailableLanguages() {
    const potentialLangs = ['en', 'sr', 'sv', 'fr', 'es', 'de', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'];
    const availableLangs = [];
    
    // Test each potential language file to see if it exists
    for (const lang of potentialLangs) {
        try {
            const response = await fetch(`../data/cvData_${lang}.json`);
            if (response.ok) {
                availableLangs.push(lang);
            }
        } catch (error) {
            // Ignore errors for missing files - this is expected behavior
            console.debug(`Language file for ${lang} not found`);
        }
    }
    
    // If no languages found, default to English
    return availableLangs.length > 0 ? availableLangs : ['en'];
}
