document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const statusMessage = document.getElementById('status-message');
    const loginContainer = document.getElementById('login-container');
    const loggedInMessage = document.getElementById('logged-in-message');
    const logoutButton = document.getElementById('logout-button');
    const STORAGE_KEY = 'user_auth_status';

    function checkLoginStatus() {
        const status = localStorage.getItem(STORAGE_KEY);
        if (status === 'logged_in') {
            loginContainer.classList.add('hidden');
            loggedInMessage.classList.remove('hidden');
        } else {
            loginContainer.classList.remove('hidden');
            loggedInMessage.classList.add('hidden');
        }
    }

    checkLoginStatus();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        statusMessage.classList.add('hidden');
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (username === '' || password === '') {
            displayMessage('Por favor, preencha todos os campos.', 'text-yellow-400');
            return;
        }

        if (username === 'usuario@gmail.com' && password === 'senha123') {
            localStorage.setItem(STORAGE_KEY, 'logged_in');
            displayMessage('Login bem-sucedido! Redirecionando...', 'text-green-400');
            setTimeout(checkLoginStatus, 1000);
        } else {
            displayMessage('Credenciais inválidas. Tente novamente.', 'text-red-400');
            passwordInput.value = '';
        }
    });

    function displayMessage(message, colorClass) {
        statusMessage.textContent = message;
        statusMessage.className = `text-sm pt-4 font-medium ${colorClass}`;
        statusMessage.classList.remove('hidden');
    }

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        checkLoginStatus();
    });
});
