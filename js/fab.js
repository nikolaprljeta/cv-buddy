export function toggleFab(fabContainer) {
    if (fabContainer) {
        fabContainer.classList.toggle('expanded');
    }
}

export function setupFabButtons(fabMainButton, fabPrintButton, fabExportMdButton, fabExportEncryptedMdButton, toggleFab) {
    if (fabMainButton) {
        fabMainButton.addEventListener('click', () => toggleFab(fabContainer));
    }

    if (fabPrintButton) {
    }
}
