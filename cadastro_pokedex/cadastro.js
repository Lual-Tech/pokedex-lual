const StorageService = {
    KEY_USERS: 'app_users',

    getUsers: function() {
        const data = localStorage.getItem(this.KEY_USERS);
        return data ? JSON.parse(data) : [];
    },

    saveUser: function(newUser) {
        const users = this.getUsers();
        if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
            throw new Error('Este e-mail já está cadastrado.');
        }

        newUser.id = Date.now();
        users.push(newUser);
        localStorage.setItem(this.KEY_USERS, JSON.stringify(users));
        return newUser;
    }
};

const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', function (e) {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
});

const form = document.getElementById('registerForm');
const feedback = document.getElementById('feedbackMessage');
const btnLoader = document.getElementById('btnLoader');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.querySelector('#submitBtn span');

function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = `p-3 rounded text-sm text-center block ${type === 'error'
        ? 'bg-red-500/20 text-red-400'
        : 'bg-green-500/20 text-green-400'}`;
}

function setLoading(isLoading) {
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-70', 'cursor-not-allowed');
    } else {
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    if (!formData.name || !formData.email || !formData.password) {
        showFeedback('Preencha todos os campos obrigatórios.', 'error');
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        showFeedback('As senhas não coincidem.', 'error');
        return;
    }

    if (formData.password.length < 6) {
        showFeedback('A senha deve ter pelo menos 6 caracteres.', 'error');
        return;
    }

    setLoading(true);
    feedback.classList.add('hidden');

    setTimeout(() => {
        try {
            const userToSave = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            };

            StorageService.saveUser(userToSave);

            showFeedback('Conta criada com sucesso! Redirecionando para o login...', 'success');
            form.reset();

            setTimeout(() => {
                console.log("Redirecionando para login...");
            }, 2000);

        } catch (error) {
            showFeedback(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }, 1500);
});
