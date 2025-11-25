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

// ===== Busca =====
const q = document.getElementById('q');
const cards = [...document.querySelectorAll('#cards .card')];

if (q) {
  q.addEventListener('input', () => {
    const term = q.value.trim().toLowerCase();
    cards.forEach(c => {
      const name = (c.dataset.name || '').toLowerCase();
      c.style.display = !term || name.includes(term) ? '' : 'none';
    });
  });
}

// ===== Favoritos (com sincronização entre duplicados) =====
const favSet = loadFavs();

function syncAllHearts() {
  const allCards = [...document.querySelectorAll('#cards .card')];
  allCards.forEach(c => {
    const id = c.dataset.id;
    const btn = c.querySelector('.fav');
    if (!btn) return;
    btn.classList.toggle('active', favSet.has(id));
  });
}
syncAllHearts();

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.fav');
  if (!btn) return;
  e.preventDefault(); e.stopPropagation();

  const card = btn.closest('.card');
  const id = card?.dataset.id;
  if (!id) return;

  if (favSet.has(id)) favSet.delete(id); else favSet.add(id);
  saveFavs(favSet);

  document
    .querySelectorAll(`#cards .card[data-id="${CSS.escape(id)}"] .fav`)
    .forEach(b => b.classList.toggle('active', favSet.has(id)));
});

// ===== Voltar (seta) =====
(() => {
  const back = document.querySelector('.back-btn');
  if (!back) return;
  back.addEventListener('click', () => {
    const ref = document.referrer;
    const sameOrigin = ref && (() => { try { return new URL(ref).origin === location.origin; } catch { return false; }})();
    if (sameOrigin && history.length > 1) history.back();
    else location.href = back.getAttribute('data-home') || './index.html';
  });
})();
