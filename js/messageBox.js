function showMessage(message, type = 'info', duration = 3000) {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message-box ${type} active`;
    setTimeout(() => {
        messageBox.classList.remove('active');
    }, duration);
}

export { showMessage };
