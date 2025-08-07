
const passwordModal = document.getElementById('passwordModal');
const passwordInput = document.getElementById('passwordInput');
const confirmPasswordBtn = document.getElementById('confirmPasswordBtn');
const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
const passwordError = document.getElementById('passwordError');

let currentPasswordAction = null;

export function showPasswordModal(action) {
    currentPasswordAction = action;
    passwordInput.value = '';
    passwordError.textContent = '';
    passwordError.classList.add('hidden');
    passwordModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    passwordInput.focus();
}

export function hidePasswordModal() {
    passwordModal.classList.remove('active');
    document.body.style.overflow = '';
    currentPasswordAction = null;
}
