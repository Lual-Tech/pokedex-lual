function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ===== Load dos pokemons =====
const cards_div = document.getElementById('cards')

async function loadPokemonApi(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error.message);
  }
}

async function loadPokemonsCards() {
  const pokemons = await loadPokemonApi("https://pokeapi.co/api/v2/pokemon-species?limit=10");

  if (!pokemons) return;

  pokemons.results.forEach(async (pokemon) => {
    const pokeDiv = document.createElement('div');

    // Extrai o ID da URL
    let pokemon_id = pokemon.url.replace(/\/+$/, ""); // remove barras no final
    const parts = pokemon_id.split("/");
    pokemon_id = parts[parts.length - 1];

    // Busca dados detalhados pra pegar a imagem
    const pokemonData = await loadPokemonApi(`https://pokeapi.co/api/v2/pokemon/${pokemon_id}/`);
    if (!pokemonData) return;

    // tenta dream_world, se não tiver, cai pra official-artwork, depois pra front_default
    const pokemon_imagem =
      pokemonData.sprites.other?.dream_world?.front_default ||
      pokemonData.sprites.other?.['official-artwork']?.front_default ||
      pokemonData.sprites.front_default;

    const pokemon_name = capitalize(pokemon.name);

    pokeDiv.classList.add('card');
    pokeDiv.dataset.id = pokemon_name;     // se quiser o ID real, use: pokemon_id
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

    cards_div.appendChild(pokeDiv);
  });
}

loadPokemonsCards();


// ===== Util: localStorage seguro =====
// Guardamos favoritos de forma simples e persistente no navegador.
// Usei Set para ter buscas O(1) e evitar duplicados. Converto Set <-> Array na hora de salvar/carregar.
const LS_KEY = 'pokedex:favs';
function loadFavs() {
  try {
    const raw = localStorage.getItem(LS_KEY);        // pode vir null na primeira vez
    const arr = raw ? JSON.parse(raw) : [];          // se quebrar o JSON, o catch garante um Set vazio
    return new Set(Array.isArray(arr) ? arr : []);   // confiro se é array por segurança
  } catch {
    return new Set();                                 // se der erro (JSON), não travo a UI
  }
}
function saveFavs(set) {
  localStorage.setItem(LS_KEY, JSON.stringify([...set])); // espalho o Set em array para serializar
}

// ===== Busca =====
// Filtro “em memória”: pego o valor do input, normalizo, e mostro/escondo cards pelo data-name.
// Vantagem: resposta imediata e sem hits na rede. Para datasets grandes, seria melhor paginar/virtualizar.
const q = document.getElementById('q');
const cards = [...document.querySelectorAll('#cards .card')];

if (q) {
  q.addEventListener('input', () => {
    const term = q.value.trim().toLowerCase();
    cards.forEach(c => {
      const name = (c.dataset.name || '').toLowerCase();          // data-name = texto base para o filtro
      c.style.display = !term || name.includes(term) ? '' : 'none'; // sumo/mostro sem remover do DOM
    });
  });
}

// ===== Favoritos (com sincronização entre duplicados) =====
// Alguns pokémons aparecem duplicados para preencher o grid. Ao favoritar/desfavoritar um,
// sincronizo todos os “corações” daquele mesmo data-id.
const favSet = loadFavs();

function syncAllHearts() {
  const allCards = [...document.querySelectorAll('#cards .card')];
  allCards.forEach(c => {
    const id = c.dataset.id;
    const btn = c.querySelector('.fav');
    if (!btn) return;
    btn.classList.toggle('active', favSet.has(id)); // .active = visual de “favoritado”
  });
}
syncAllHearts();

// Delegação no documento evita adicionar 1 listener por botão.
// Uso closest('.fav') para pegar só cliques que nasceram no botão ou filhos dele.
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.fav');
  if (!btn) return;
  e.preventDefault(); e.stopPropagation();

  const card = btn.closest('.card');
  const id = card?.dataset.id;
  if (!id) return;

  // Toggle no Set e persisto no localStorage
  if (favSet.has(id)) favSet.delete(id); else favSet.add(id);
  saveFavs(favSet);

  // Atualizo todos os botões daquele mesmo Pokémon (sincronia visual)
  document
    .querySelectorAll(`#cards .card[data-id="${CSS.escape(id)}"] .fav`)
    .forEach(b => b.classList.toggle('active', favSet.has(id)));
});

// ===== Voltar (seta) =====
// Comportamento “inteligente”: se vier de uma página da mesma origem e houver histórico,
// uso history.back() (mais rápido e mantém scroll). Caso contrário, vou para data-home.
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
