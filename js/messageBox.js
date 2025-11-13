/**
 * Displays a message in the message box UI element.
 * @param {string} message - The message to display.
 * @param {string} [type='info'] - The message type (info, success, error, warning).
 * @param {number} [duration=3000] - Duration in milliseconds before auto-hiding.
 */
function showMessage(message, type = 'info', duration = 3000) {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message-box ${type} active`;
    setTimeout(() => {
        messageBox.classList.remove('active');
    }, duration);
}

export { showMessage };
