import { showMessage } from './messageBox.js';

/**
 * Downloads a file with the given content
 * @param {string} content - The file content
 * @param {string} fileName - The file name
 * @param {string} mimeType - The MIME type for the file
 * @returns {boolean} Success status
 */
function downloadFile(content, fileName, mimeType) {
    try {
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('File download failed:', error);
        showMessage('File download failed.', 'error');
        return false;
    }
}

/**
 * Validates CV data before export
 * @param {object} cvData - The CV data object
 * @returns {boolean} Is valid
 */
function validateCvData(cvData) {
    return cvData && typeof cvData === 'object' && cvData.name;
}

/**
 * Generic export handler that reduces code duplication
 * @param {object} cvData - The CV data object
 * @param {Function} converter - The conversion function
 * @param {string} fileName - The file name
 * @param {string} mimeType - The MIME type
 * @param {string} exportType - The export type for messaging
 * @param {Array} availableLangs - Available languages (optional)
 * @param {object} languageNamesMap - Language names mapping (optional)
 * @returns {boolean} Success status
 */
function handleExport(cvData, converter, fileName, mimeType, exportType, availableLangs = [], languageNamesMap = {}) {
    if (!validateCvData(cvData)) {
        showMessage(`No CV data available for ${exportType} export. Please ensure CV is loaded.`, 'error');
        console.error(`Export to ${exportType}: cvData or cvData.name is missing.`, cvData);
        return false;
    }
    
    const content = converter(cvData, availableLangs, languageNamesMap);
    if (!content) {
        showMessage(`${exportType} conversion failed.`, 'error');
        console.error(`${exportType} conversion failed. cvData:`, cvData);
        return false;
    }
    
    const success = downloadFile(content, fileName, mimeType);
    if (success) {
        showMessage(`CV exported to ${exportType}!`, 'success');
    }
    
    return success;
}

export { downloadFile, validateCvData, handleExport };
