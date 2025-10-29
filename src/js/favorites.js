// ===== Catálogo mínimo para renderizar favoritos =====
// Obs: isso aqui é um “mini-banco” só com os Pokémons que eu uso.
// Cada item tem: id (chave), name (texto que aparece), img (SVG local) e bg (gradiente do card).
const POKEDEX = {
  jigglypuff: {id:'jigglypuff', name:'Jigglypuff', img:'../../public/img/jiggly.svg', bg:'var(--rosagrad)'},
  bulbasaur:  {id:'bulbasaur',  name:'Bulbasaur',  img:'../../public/img/bulba.svg',    bg:'var(--verdegrad)'},
  squirtle:   {id:'squirtle',   name:'Squirtle',   img:'../../public/img/squirtle.svg', bg:'var(--azulgrad)'},
  charmander: {id:'charmander', name:'Charmander', img:'../../public/img/chari.svg',    bg:'var(--largrad)'},
  sprigatito: {id:'sprigatito', name:'Sprigatito', img:'../../public/img/sprigatito.svg', bg:'var(--verdegrad)'}
};

// ===== localStorage: como estou salvando =====
// - O localStorage é um "bloco de notas" do navegador, por domínio, que guarda pares chave/valor como string.
// - Eu salvo apenas os IDs dos favoritos (ex.: ["squirtle","bulbasaur"]) para ficar leve e rápido.
// - Para evitar duplicados e facilitar "toggle", uso Set na memória e converto para Array quando vou salvar.
// - Chave única: assim não conflita com outras páginas do mesmo domínio/projeto.
const LS_KEY = 'pokedex:favs';

// Carrega favoritos do localStorage:
// 1) Busca a string salva na chave LS_KEY.
// 2) Se existir, faz JSON.parse para virar array; se não, usa [].
// 3) Confere se é array e devolve um Set com esses itens (garante unicidade e buscas O(1)).
// 4) Se der qualquer erro (quota cheia, JSON inválido etc.), volta um Set vazio (UI não quebra).
function loadFavs() {
  try {
    const raw = localStorage.getItem(LS_KEY);      // ex.: '["squirtle","bulbasaur"]' ou null
    const arr = raw ? JSON.parse(raw) : [];        // vira array JS ou []
    return new Set(Array.isArray(arr) ? arr : []); // robustez: se não for array, ignoro e sigo vazio
  } catch {
    return new Set();                              // fallback seguro: não trava a tela se storage falhar
  }
}

// Salva o Set atual no localStorage:
// 1) Espalho o Set em um array (ex.: ["squirtle","bulbasaur"]).
// 2) JSON.stringify para virar string.
// 3) localStorage.setItem escreve/atualiza a chave.
// Obs: se o navegador estiver em modo privacidade restrita, pode lançar erro — mas aqui não capturo
// porque é raro; o fluxo normal é funcionar “silenciosamente”.
function saveFavs(set) {
  localStorage.setItem(LS_KEY, JSON.stringify([...set]));
}

// ===== Renderização da tela =====
// Pego o container da grade (#cards) e o input de busca (#q).
const listEl = document.getElementById('cards');
const searchEl = document.getElementById('q');

// Render monta os cards a partir do que estiver no localStorage.
// Fluxo:
// - Lê o Set dos favoritos.
// - Mapeia IDs -> objetos do POKEDEX (descarta IDs desconhecidos).
// - Aplica filtro pelo termo de busca (client-side, instantâneo).
// - Gera o HTML dos cards OU um “estado vazio” (call-to-action).
function render() {
  const favs = loadFavs();                                        // ex.: Set {'squirtle','bulbasaur'}
  const items = [...favs].map(id => POKEDEX[id]).filter(Boolean); // resolve para objetos (e remove IDs inválidos)
  const term = (searchEl?.value || '').trim().toLowerCase();      // termo normalizado

  // Estado vazio: não há nada salvo no localStorage (ou o usuário removeu tudo).
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

  // Filtro local (não bate em rede): mostra só o que contém o termo no nome.
  const filtered = items.filter(p => !term || p.name.toLowerCase().includes(term));

  // Se houver resultados, pinto; se não, aviso que nada bateu com o termo.
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

// Re-render sempre que o usuário digitar na busca.
searchEl?.addEventListener('input', render);

// Remoção (desfavoritar):
// - Uso delegação de evento no document para capturar cliques em .fav, inclusive em cards recém-renderizados.
// - Quando clica, leio o data-id do card; tiro do Set; salvo no localStorage; chamo render() de novo.
// - Isso garante que a UI esteja sempre em “modo verdade” do storage (fonte de dados).
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.fav');
  if(!btn) return;
  e.preventDefault(); e.stopPropagation();

  const card = btn.closest('.card');
  const id = card?.dataset.id;
  if(!id) return;

  const favs = loadFavs(); // pego o Set atual do storage
  favs.delete(id);         // removo o item clicado
  saveFavs(favs);          // persisto a nova versão (sincronizada com disco)
  render();                // redesenho a tela com base no storage atualizado
});

// Primeira renderização da página (carrega o que já havia sido salvo anteriormente).
render();

// ===== Voltar (seta) =====
// Mesmo comportamento das outras telas:
// - Se vier de mesma origem e houver histórico, uso history.back().
// - Senão, caio no data-home ou ../index.html.
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

