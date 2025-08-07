function xorEncryptDecrypt(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
}

function xorDecrypt(encodedText, key) {
    try {
        const decoded = atob(encodedText);
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    } catch (e) {
        console.error("Decryption error:", e);
        return null;
    }
}

export { xorEncryptDecrypt, xorDecrypt };
