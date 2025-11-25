// --- MÁSCARA DE TELEFONE ---
window.phoneMask = function(input) {
    let value = input.value.replace(/\D/g,'');
    value = value.replace(/^(\d{2})(\d)/g,"($1) $2");
    value = value.replace(/(\d)(\d{4})$/,"$1-$2");
    input.value = value;
}

// --- LÓGICA DE CADASTRO ---
const form = document.getElementById('register-form');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        showToast("As senhas não coincidem", "error");
        return;
    }

    const originalText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="ph-bold ph-spinner animate-spin text-xl"></i>`;

    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users_db')) || [];

        if (users.find(u => u.email === email)) {
            showToast("Este e-mail já está em uso", "error");
            resetButton(originalText);
        } else {
            const newUser = {
                id: Date.now(),
                name,
                email,
                phone,
                password 
            };
            
            users.push(newUser);
            localStorage.setItem('users_db', JSON.stringify(users));
            
            showToast("Usuário cadastrado com sucesso!");

            document.body.innerHTML = `
                <div class="fixed inset-0 w-full h-full flex flex-col items-center justify-center text-white fade-enter" style="background-color: #050505; z-index: 9999;">
                    <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                        <i class="ph-bold ph-check text-4xl"></i>
                    </div>
                    <h2 class="text-3xl font-bold">Conta Criada!</h2>
                    <p class="text-gray-400 mt-2">O usuário <span class="text-white">${name}</span> foi registrado.</p>
                    <button onclick="location.reload()" class="mt-8 text-sm text-gray-500 hover:text-white underline">Cadastrar outro</button>
                </div>
            `;
        }
    }, 1000);
});

function resetButton(text) {
    submitBtn.disabled = false;
    submitBtn.innerText = text;
}

// --- TOAST ---
function showToast(msg, type = 'success') {
    const area = document.getElementById('notification-area');
    const toast = document.createElement('div');
    const bg = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
    
    toast.className = `${bg} text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 min-w-[300px] animate-[slideIn_0.3s_ease-out]`;
    toast.innerHTML = `<i class="ph-bold ${type === 'success'?'ph-check-circle':'ph-warning-circle'} text-xl"></i><span class="text-sm font-medium">${msg}</span>`;
    
    area.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-full', 'transition-all', 'duration-300');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
