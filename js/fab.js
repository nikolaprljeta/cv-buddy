// filepath: /cv-buddy/cv-buddy/js/fab.js
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
        fabPrintButton.addEventListener('click', function() {
            console.log("Print button clicked: Activating Print theme.");
            if (printThemeStylesheet) {
                printThemeStylesheet.media = 'print';
                console.log("Print theme stylesheet media set to 'print'.");
            }

            window.print();

            setTimeout(() => {
                console.log("Resetting stylesheet media after print dialog.");
                if (printThemeStylesheet) {
                    printThemeStylesheet.media = 'print';
                }
            }, 500);

            toggleFab(fabContainer);
        });
    }

    if (fabExportMdButton) {
        fabExportMdButton.addEventListener('click', function() {
            // Logic for exporting Markdown
            toggleFab(fabContainer);
        });
    }

    if (fabExportEncryptedMdButton) {
        fabExportEncryptedMdButton.addEventListener('click', function() {
            // Logic for exporting encrypted Markdown
            toggleFab(fabContainer);
        });
    }
}
