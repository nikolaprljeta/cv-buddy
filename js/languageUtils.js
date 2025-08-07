function getLanguageDisplayName(langCode) {
    switch (langCode) {
        case 'en': return 'English';
        case 'sr': return 'Serbian';
        case 'sv': return 'Swedish';
        case 'fr': return 'French';
        case 'es': return 'Spanish';
        case 'de': return 'German';
        case 'it': return 'Italian';
        case 'ja': return 'Japanese';
        case 'ko': return 'Korean';
        case 'pt': return 'Portuguese';
        case 'ru': return 'Russian';
        case 'zh': return 'Chinese';
        default: return langCode.toUpperCase();
    }
}

function updateActiveLanguageLink(currentLang) {
    document.querySelectorAll('.language-list-item').forEach(link => {
        if (link.dataset.lang === currentLang) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

export { getLanguageDisplayName, updateActiveLanguageLink };
