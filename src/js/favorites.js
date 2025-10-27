// ===== Catálogo mínimo para renderizar favoritos =====
const POKEDEX = {
  jigglypuff: {id:'jigglypuff', name:'Jigglypuff', img:'../../public/img/jiggly.svg', bg:'var(--rosagrad)'},
  bulbasaur:  {id:'bulbasaur',  name:'Bulbasaur',  img:'../../public/img/bulba.svg',    bg:'var(--verdegrad)'},
  squirtle:   {id:'squirtle',   name:'Squirtle',   img:'../../public/img/squirtle.svg', bg:'var(--azulgrad)'},
  charmander: {id:'charmander', name:'Charmander', img:'../../public/img/chari.svg',    bg:'var(--largrad)'},
  sprigatito: {id:'sprigatito', name:'Sprigatito', img:'../../public/img/sprigatito.svg', bg:'var(--verdegrad)'}
};

// ===== Util: localStorage seguro =====
const LS_KEY = 'pokedex:favs';
function loadFavs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}
function saveFavs(set) {
  localStorage.setItem(LS_KEY, JSON.stringify([...set]));
}

// ===== Render =====
const listEl = document.getElementById('cards');
const searchEl = document.getElementById('q');

function render() {
  const favs = loadFavs();
  const items = [...favs].map(id => POKEDEX[id]).filter(Boolean);
  const term = (searchEl?.value || '').trim().toLowerCase();

  if (!items.length) {
    listEl.innerHTML = `
      <div style="grid-column: 1/-1; display:grid; place-items:center; padding:42px 12px; opacity:.9">
        <div style="font-size:42px; margin-bottom:10px">⭐</div>
        <div style="font-weight:700; margin-bottom:6px">Você ainda não favoritou nenhum Pokémon</div>
        <div style="opacity:.85; margin-bottom:14px">Explore a lista e toque no coração para adicionar aos favoritos.</div>
        <a href="../browse.html" style="display:inline-block; padding:12px 18px; border-radius:999px; 
           background:rgba(255,255,255,.14); border:1px solid #ffffff40; color:#fff; text-decoration:none;">
          Ver Pokémons
        </a>
      </div>`;
    return;
  }

  const filtered = items.filter(p => !term || p.name.toLowerCase().includes(term));
  listEl.innerHTML = filtered.map(p => `
    <div class="card" data-id="${p.id}">
      <button class="fav" type="button" title="Desfavoritar">❤</button>
      <div class="thumb" style="background:${p.bg}">
        <img alt="${p.name}" src="${p.img}">
      </div>
      <div class="meta"><span>${p.name}</span><span class="pill">➜</span></div>
    </div>
  `).join('') || `
    <p style="opacity:.8; margin:0 16px">Nenhum favorito encontrado para "${term}".</p>
  `;
}

searchEl?.addEventListener('input', render);

// remover favorito
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.fav');
  if(!btn) return;
  e.preventDefault(); e.stopPropagation();

  const card = btn.closest('.card');
  const id = card?.dataset.id;
  if(!id) return;

  const favs = loadFavs();
  favs.delete(id);
  saveFavs(favs);
  render();
});

render();

// ===== Voltar (seta) =====
(() => {
  const back = document.querySelector('.back-btn');
  if(!back) return;
  back.addEventListener('click', () => {
    const ref = document.referrer;
    const sameOrigin = ref && (() => { try { return new URL(ref).origin === location.origin; } catch { return false; }})();
    if (sameOrigin && history.length > 1) history.back();
    else location.href = back.getAttribute('data-home') || '../index.html';
  });
})();
