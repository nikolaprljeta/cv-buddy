/**
 * Converts a CV data object into a JSON formatted string.
 * This function handles the direct serialization of the CV data.
 * @param {object} data - The CV data object.
 * @returns {string} The JSON formatted string.
 */
function convertCvToJson(data) {
    // The JSON.stringify method is used to convert a JavaScript object into a JSON string.
    // The third parameter '2' is for indentation, making the output human-readable.
    return JSON.stringify(data, null, 2);
}

export { convertCvToJson };
