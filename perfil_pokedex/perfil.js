document.addEventListener('DOMContentLoaded', () => {
    // Seletores
    const xpBar = document.getElementById('xp-bar');
    const tabFavoritos = document.getElementById('tab-favoritos');
    const tabCapturados = document.getElementById('tab-capturados');
    const tabs = [tabFavoritos, tabCapturados];

    // Barra de XP animada
    const xpPercent = 49.12; // porcentagem simulada
    let width = 0;
    const interval = setInterval(() => {
        if (width >= xpPercent) { clearInterval(interval); return; }
        width += 0.5;
        xpBar.style.width = width + '%';
    }, 10);

    // Função para ativar aba
    function activateTab(tab) {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        console.log(`A aba "${tab.textContent.trim()}" foi ativada!`);
    }

    // Eventos de clique
    tabFavoritos.addEventListener('click', (e) => { e.preventDefault(); activateTab(tabFavoritos); });
    tabCapturados.addEventListener('click', (e) => { e.preventDefault(); activateTab(tabCapturados); });

    // Configurações - alert simulando ação
    document.querySelectorAll('.config-item').forEach(item => {
        item.addEventListener('click', () => {
            alert(`Você clicou em: ${item.innerText.trim()}`);
        });
    });
});
