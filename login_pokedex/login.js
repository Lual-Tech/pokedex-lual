const appState = {
    isLoading: false,
    currentUser: null,
    error: null
};

const StorageService = {
    KEY_USERS: 'app_users',
    KEY_SESSION: 'app_current_session',

    initMockData: function () {
        const users = this.getUsers();
        if (users.length === 0) {
            const mockUser = {
                id: 1,
                email: 'usuario@gmail.com',
                password: '123456',
                name: 'Treinador Pokémon'
            };
            this.saveUser(mockUser);
            console.log('Usuário de teste criado: usuario@gmail.com / 123456');
        }
    },

    getUsers: function () {
        const data = localStorage.getItem(this.KEY_USERS);
        return data ? JSON.parse(data) : [];
    },

    saveUser: function (user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem(this.KEY_USERS, JSON.stringify(users));
    },

    authenticate: function (email, password) {
        const users = this.getUsers();
        const user = users.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (user) {
            localStorage.setItem(
                this.KEY_SESSION,
                JSON.stringify({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    loginTime: new Date().toISOString()
                })
            );
            return user;
        }
        return null;
    }
};

const DOM = {
    form: document.getElementById('loginForm'),
    emailInput: document.getElementById('email'),
    passInput: document.getElementById('password'),
    submitBtn: document.getElementById('submitBtn'),
    btnLoader: document.getElementById('btnLoader'),
    btnText: document.querySelector('#submitBtn span'),
    feedback: document.getElementById('feedbackMessage'),

    setLoading: function (loading) {
        appState.isLoading = loading;
        if (loading) {
            this.btnText.style.display = 'none';
            this.btnLoader.style.display = 'block';
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('opacity-70', 'cursor-not-allowed');
        } else {
            this.btnText.style.display = 'block';
            this.btnLoader.style.display = 'none';
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
        }
    },

    showFeedback: function (message, type) {
        this.feedback.textContent = message;
        this.feedback.classList.remove('hidden', 'bg-red-500/20', 'text-red-400', 'bg-green-500/20', 'text-green-400');

        if (type === 'error') {
            this.feedback.classList.add('bg-red-500/20', 'text-red-400', 'block');
        } else {
            this.feedback.classList.add('bg-green-500/20', 'text-green-400', 'block');
        }
    },

    clearFeedback: function () {
        this.feedback.classList.add('hidden');
    }
};

function init() {
    StorageService.initMockData();

    DOM.form.addEventListener('submit', handleLoginSubmit);

    DOM.emailInput.addEventListener('input', () => DOM.clearFeedback());
    DOM.passInput.addEventListener('input', () => DOM.clearFeedback());
}

async function handleLoginSubmit(event) {
    event.preventDefault();

    const email = DOM.emailInput.value.trim();
    const password = DOM.passInput.value.trim();

    if (!email || !password) {
        DOM.showFeedback('Por favor, preencha todos os campos.', 'error');
        return;
    }

    DOM.setLoading(true);
    DOM.clearFeedback();

    setTimeout(() => {
        try {
            const user = StorageService.authenticate(email, password);

            if (user) {
                appState.currentUser = user;
                DOM.showFeedback(`Bem-vindo de volta, ${user.name}! Redirecionando...`, 'success');
                console.log("Login efetuado com sucesso:", user);
            } else {
                throw new Error('E-mail ou senha incorretos.');
            }
        } catch (error) {
            appState.error = error.message;
            DOM.showFeedback(error.message, 'error');
        } finally {
            DOM.setLoading(false);
        }
    }, 1500);
}

document.addEventListener('DOMContentLoaded', init);
