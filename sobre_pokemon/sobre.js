let isFavorite = false;

window.onload = function() {
    try {
        const fav = localStorage.getItem('squirtle_fav_v4');
        isFavorite = (fav === 'true');
    } catch (e) { console.log("LocalStorage indisponível"); }

    updateFavoriteIcons();
};

function toggleFavorite() {
    isFavorite = !isFavorite;
    updateFavoriteIcons();
    try { localStorage.setItem('squirtle_fav_v4', isFavorite); } catch(e){}
}

function updateFavoriteIcons() {
    const mainIcon = document.getElementById('main-heart-icon');
    const navIcon = document.getElementById('nav-heart-icon');
    const navBtn = document.getElementById('nav-fav-btn');
    
    if (isFavorite) {
        [mainIcon, navIcon].forEach(i => {
            i.classList.remove('ph'); 
            i.classList.add('ph-fill');
            i.classList.add('text-red-500', 'drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]');
        });
        navBtn.classList.add('text-red-500');
    } else {
        [mainIcon, navIcon].forEach(i => {
            i.classList.remove('ph-fill');
            i.classList.add('ph');
            i.classList.remove('text-red-500', 'drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]');
        });
        navBtn.classList.remove('text-red-500');
    }
}

document.getElementById('main-heart-btn').addEventListener('click', toggleFavorite);
document.getElementById('nav-fav-btn').addEventListener('click', toggleFavorite);
