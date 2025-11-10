document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const statusMessage = document.getElementById('status-message');
    const registerContainer = document.getElementById('register-container');
    const loggedInMessage = document.getElementById('logged-in-message');
    const logoutButton = document.getElementById('logout-button');

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    const STORAGE_KEY = 'user_auth_status';

    function checkLoginStatus() {
        const status = localStorage.getItem(STORAGE_KEY);
        registerContainer.classList.toggle('hidden', status === 'logged_in');
        loggedInMessage.classList.toggle('hidden', status !== 'logged_in');
    }

    checkLoginStatus();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        statusMessage.classList.add('hidden');
        statusMessage.textContent = '';

        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (!nameInput.value.trim() || !emailInput.value.trim() || !phoneInput.value.trim() || !password || !confirmPassword) {
            return displayMessage('Por favor, preencha todos os campos.', 'text-yellow-400');
        }

        if (password.length < 6) {
            return displayMessage('A senha deve ter pelo menos 6 caracteres.', 'text-yellow-400');
        }

        if (password !== confirmPassword) {
            passwordInput.value = '';
            confirmPasswordInput.value = '';
            return displayMessage('As senhas não coincidem.', 'text-red-400');
        }

        localStorage.setItem(STORAGE_KEY, 'logged_in');
        displayMessage('Cadastro bem-sucedido! Você será redirecionado...', 'text-green-400');
        setTimeout(checkLoginStatus, 1000);
    });

    function displayMessage(message, colorClass) {
        statusMessage.textContent = message;
        statusMessage.className = `text-sm pt-4 font-medium ${colorClass}`;
        statusMessage.classList.remove('hidden');
    }

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        checkLoginStatus();
        displayMessage('Você saiu da sua conta.', 'text-gray-400');
    });
});
