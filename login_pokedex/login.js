const AppState = { mode: 'login' };

// Elementos
const form = document.getElementById('auth-form');
const pageTitle = document.getElementById('page-title');
const toggleBtn = document.getElementById('toggle-mode-btn');
const footerText = document.getElementById('footer-text');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const notifArea = document.getElementById('notification-area');

// Notificação Toast
function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    const bg = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
    const icon = type === 'success' ? 'ph-check-circle' : 'ph-warning-circle';
    
    toast.className = `${bg} text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 min-w-[300px] transform translate-x-full transition-all duration-300`;
    toast.innerHTML = `<i class="ph-bold ${icon} text-xl"></i><span class="text-sm font-medium">${msg}</span>`;
    
    notifArea.appendChild(toast);
    
    requestAnimationFrame(() => toast.classList.remove('translate-x-full'));
    
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Alternar Login / Cadastro
function toggleMode() {
    form.reset();
    const isLogin = AppState.mode === 'login';
    
    const container = document.getElementById('auth-container');
    container.classList.remove('fade-enter');
    void container.offsetWidth; 
    container.classList.add('fade-enter');

    if (isLogin) {
        AppState.mode = 'register';
        pageTitle.innerText = "Crie sua conta";
        submitBtn.innerText = "Criar conta";
        footerText.innerText = "Já tem uma conta?";
        toggleBtn.innerText = "Faça login";
        emailInput.placeholder = "exemplo@email.com";
    } else {
        AppState.mode = 'login';
        pageTitle.innerText = "Faça login para continuar";
        submitBtn.innerText = "Entrar";
        footerText.innerText = "Não possui uma conta?";
        toggleBtn.innerText = "Cadastre-se agora";
        emailInput.placeholder = "Usuario@gmail.com";
    }
}

toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMode();
});

// Submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const pwd = passwordInput.value.trim();

    if (!email || !pwd) {
        showToast("Preencha todos os campos", "error");
        return;
    }

    const originalText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="ph-bold ph-spinner animate-spin text-xl"></i>`;
    
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users_db')) || [];
        
        if (AppState.mode === 'register') {
            if (users.find(u => u.email === email)) {
                showToast("Este e-mail já está cadastrado", "error");
            } else {
                users.push({ email, pwd, id: Date.now() });
                localStorage.setItem('users_db', JSON.stringify(users));
                showToast("Conta criada! Faça login.");
                toggleMode();
            }
        } else {
            const user = users.find(u => u.email === email && u.pwd === pwd);
            if (user) {
                showToast("Login realizado com sucesso!");
                localStorage.setItem('session', JSON.stringify({ user: user.email }));
                
                document.body.innerHTML = `
                    <div class="h-screen w-screen flex flex-col items-center justify-center text-white fade-enter" style="background-color: #050505;">
                        <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                            <i class="ph-bold ph-check text-3xl"></i>
                        </div>
                        <h2 class="text-2xl font-bold">Bem-vindo de volta!</h2>
                        <p class="text-gray-400 mt-2">${email}</p>
                        <button onclick="location.reload()" class="mt-8 text-sm text-gray-500 hover:text-white">Sair</button>
                    </div>
                `;
            } else {
                showToast("E-mail ou senha incorretos", "error");
            }
        }
        
        if (document.getElementById('submit-btn')) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    }, 1000);
});

// Recupera último email digitado
const lastEmail = localStorage.getItem('last_email');
if (lastEmail) emailInput.value = lastEmail;

emailInput.addEventListener('blur', () => {
    if (emailInput.value) localStorage.setItem('last_email', emailInput.value);
});