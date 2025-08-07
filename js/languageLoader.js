// Dynamically loads available languages from the data folder by scanning for cvData_*.json files
export async function getAvailableLanguages() {
    // This will only work in environments where fetch can list directory contents (not in static hosting)
    // For static hosting, you must maintain a manifest or hardcode the list
    const response = await fetch('/data/');
    const text = await response.text();
    // Parse the directory listing for cvData_*.json
    const regex = /cvData_([a-z]{2,}).json/g;
    let match;
    const langs = [];
    while ((match = regex.exec(text)) !== null) {
        langs.push(match[1]);
    }
    return langs;
}
