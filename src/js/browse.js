function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ===== DOM / constantes =====
const cards_div = document.getElementById('cards');
const PAGE_SIZE = 18;          // 18 cards por página
let nextOffset = 0;            // próximo offset na PokeAPI
let isLoadingPage = false;
let totalCount = null;

const loadMoreBtn = document.getElementById('load-more');

// ===== Cache simples de API (memória) =====
window.apiCache = new Map();
const apiCache = window.apiCache;


async function loadPokemonApi(url) {
  // se já tiver no cache, reutiliza
  if (apiCache.has(url)) {
    return apiCache.get(url);
  }

  // guarda a Promise no cache para evitar múltiplos fetchs simultâneos do mesmo recurso
  const promise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(error.message);
      // se der erro, não deixa a entrada “quebrada” no cache
      apiCache.delete(url);
      throw error;
    }
  })();

  apiCache.set(url, promise);
  return promise;
}

// ===== Criação de um card de Pokémon =====
async function createPokemonCard(pokemon) {
  let pokemon_id = pokemon.url.replace(/\/+$/, ""); // remove barras finais
  const parts = pokemon_id.split("/");
  pokemon_id = parts[parts.length - 1];

  // detalhes do Pokémon (para pegar sprite)
  const pokemonData = await loadPokemonApi(`https://pokeapi.co/api/v2/pokemon/${pokemon_id}/`);
  if (!pokemonData) return null;

  const pokemon_imagem =
    pokemonData.sprites.other?.dream_world?.front_default ||
    pokemonData.sprites.other?.['official-artwork']?.front_default ||
    pokemonData.sprites.front_default;

  const pokemon_name = capitalize(pokemon.name);''

  const pokeDiv = document.createElement('div');
  pokeDiv.classList.add('card');
  // você pode trocar para pokemon_id se preferir usar o ID numérico nos favoritos
  pokeDiv.dataset.id = pokemon_id;
  pokeDiv.dataset.name = pokemon_name;

  pokeDiv.innerHTML = `
    <button class="fav" title="Favoritar" type="button">❤</button>
    <div class="thumb" style="background:var(--verdegrad)">
      <img alt="${pokemon_name}" src="${pokemon_imagem}">
    </div>
    <div class="meta">
      <span>${pokemon_name}</span>
      <span class="pill">➜</span>
    </div>
  `;

  return pokeDiv;
}

// ===== Paginação: carrega 1 página (18 cards) =====
async function loadPokemonsPage() {
  if (isLoadingPage) return;
  isLoadingPage = true;

  if (loadMoreBtn) {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Carregando...';
  }

  const url = `https://pokeapi.co/api/v2/pokemon-species?offset=${nextOffset}&limit=${PAGE_SIZE}`;
  let pokemons;

  try {
    pokemons = await loadPokemonApi(url);
  } catch {
    if (loadMoreBtn) {
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Tentar novamente';
    }
    isLoadingPage = false;
    return;
  }

  if (!pokemons) {
    isLoadingPage = false;
    return;
  }

  if (totalCount === null) {
    totalCount = pokemons.count; // total de espécies na PokeAPI
  }

  // cria os 18 cards desta página
  for (const pokemon of pokemons.results) {
    const card = await createPokemonCard(pokemon);
    if (card) cards_div.appendChild(card);
  }

  // depois de criar os cards desta página:
  syncAllHearts();      // aplica estado de favoritos
  applyCurrentFilter(); // respeita o termo de busca atual

  nextOffset += pokemons.results.length;

  if (loadMoreBtn) {
    // se já carregou tudo, some com o botão
    if (nextOffset >= totalCount || pokemons.results.length === 0) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Carregar mais';
    }
  }

  isLoadingPage = false;
}

// primeira página ao carregar
loadPokemonsPage();
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', loadPokemonsPage);
}

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
let currentSearchTerm = '';
const q = document.getElementById('q');

function applyCurrentFilter() {
  const term = currentSearchTerm;
  const allCards = document.querySelectorAll('#cards .card');

  allCards.forEach(c => {
    const name = (c.dataset.name || '').toLowerCase();
    c.style.display = !term || name.includes(term) ? '' : 'none';
  });
}

if (q) {
  q.addEventListener('input', () => {
    currentSearchTerm = q.value.trim().toLowerCase();
    applyCurrentFilter();
  });
}

// ===== Favoritos =====
const favSet = loadFavs();

function syncAllHearts() {
  const allCards = document.querySelectorAll('#cards .card');
  allCards.forEach(c => {
    const id = c.dataset.id;
    const btn = c.querySelector('.fav');
    if (!btn || !id) return;
    btn.classList.toggle('active', favSet.has(id));
  });
}

// chamada inicial (se já existirem cards na tela)
syncAllHearts();

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.fav');
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  const card = btn.closest('.card');
  const id = card?.dataset.id;
  if (!id) return;

  if (favSet.has(id)) favSet.delete(id);
  else favSet.add(id);

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
    const sameOrigin = ref && (() => {
      try { return new URL(ref).origin === location.origin; } catch { return false; }
    })();

    if (sameOrigin && history.length > 1) history.back();
    else location.href = back.getAttribute('data-home') || './index.html';
  });
})();
