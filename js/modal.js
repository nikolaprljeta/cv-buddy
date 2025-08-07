const profileImage = document.getElementById('profileImage');
const profileImageModal = document.getElementById('profileImageModal');
const enlargedProfileImage = document.getElementById('enlargedProfileImage');

function openModal() {
    if (profileImage && enlargedProfileImage && profileImageModal) {
        enlargedProfileImage.src = profileImage.src;
        profileImageModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    if (profileImageModal) {
        profileImageModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

if (profileImage) {
    profileImage.addEventListener('click', openModal);
}
if (profileImageModal) {
    profileImageModal.addEventListener('click', closeModal);
}
