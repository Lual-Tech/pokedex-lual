const StorageService = {
    KEY_SESSION: 'app_current_session',

    getSession: function() {
        const data = localStorage.getItem(this.KEY_SESSION);
        return data ? JSON.parse(data) : null;
    },

    logout: function() {
        localStorage.removeItem(this.KEY_SESSION);
        window.location.href = 'index.html';
    }
};

function initProfile() {
    const session = StorageService.getSession();
    const nameElement = document.getElementById('userName');

    if (session && session.name) {
        const displayId = String(session.id).slice(-2).padStart(2, '0'); 
        nameElement.textContent = `${session.name}#${displayId}`;
    } else {
        nameElement.textContent = "Misty#01";
    }

    document.getElementById('logoutBtn').addEventListener('click', () => {
        if(confirm('Deseja realmente sair?')) {
            StorageService.logout();
        }
    });
}

document.addEventListener('DOMContentLoaded', initProfile);
