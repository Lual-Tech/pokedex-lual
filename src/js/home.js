// Home.js — alterna o “tema” do herói (fundo + Pokémon) em loop simples.
// Ideia: ter duas camadas (A/B) e duas “figuras” (pokeA/pokeB) e ficar trocando
// a classe .show entre elas. Isso evita flicker, porque sempre tem uma camada pronta
// enquanto a outra sai/entra com transição CSS.

// Catálogo de temas: nome (para A11Y), gradiente (CSS var) e caminho do SVG do Pokémon.
const THEMES = [
  { name:'Squirtle',   grad:'var(--azulgrad)',  hero:'../public/img/squirtle.svg' },
  { name:'Bulbasaur',  grad:'var(--verdegrad)', hero:'../public/img/bulba.svg' },
  { name:'Jigglypuff', grad:'var(--rosagrad)',  hero:'../public/img/jiggly.svg' },
  { name:'Charmander', grad:'var(--largrad)',   hero:'../public/img/chari.svg' },
  { name:'Sprigatito', grad:'var(--verdegrad)', hero:'../public/img/sprigatito.svg' }
];

// Referências às duas camadas do fundo (bgA/bgB)…
const bgA = document.getElementById('bgA');
const bgB = document.getElementById('bgB');
// …e às duas “figuras” (pokeA/pokeB) que recebem os SVGs.
const pokeA = document.getElementById('pokeA');
const pokeB = document.getElementById('pokeB');
// Região que representa a “imagem” para leitores de tela.
const pokeRegion = document.querySelector('.pokemon');

// i controla qual tema está ativo; useA decide se a próxima troca usa o “lado A ou B”.
// Esse flip-flop é o que permite animar sem piscar (uma entra, a outra sai).
let i = 0;
let useA = true;

// Troca o tema atual aplicando gradiente no fundo e SVG no Pokémon.
// Também atualiza aria-label para acessibilidade (quem usa leitor de tela “ouve” o nome).
function applyTheme(idx) {
  const t = THEMES[idx % THEMES.length]; // % garante que o índice sempre “cicle” na lista.

  // Escolhe quem vai aparecer e quem vai sumir no fundo (camadas A/B).
  const show = useA ? bgB : bgA;
  const hide = useA ? bgA : bgB;

  // Aplica o gradiente da vez, mostra uma camada e esconde a outra.
  show.style.background = t.grad;
  show.classList.add('show');
  hide.classList.remove('show');

  // Mesma lógica para as figuras (pokeA/pokeB). A que “entra” recebe a nova imagem.
  const pShow = useA ? pokeB : pokeA;
  const pHide = useA ? pokeA : pokeB;

  // backgroundImage com o SVG do tema atual. .show torna visível; .float dá leve animação.
  pShow.style.backgroundImage = `url('${t.hero}')`;
  pShow.classList.add('show', 'float');
  pHide.classList.remove('show', 'float');

  // Mantém a descrição da “imagem” coerente com o que está na tela.
  pokeRegion.setAttribute('aria-label', t.name);

  // Inverte o lado para a próxima rodada (A ↔ B).
  useA = !useA;
}

// Inicia com o primeiro tema visível para não ficar tela “vazia”.
applyTheme(0);

// A cada 3 segundos, avança para o próximo tema e aplica a troca.
// setInterval é suficiente aqui porque a transição é leve. Se fosse pesado,
// poderíamos usar requestAnimationFrame ou pausar quando a aba estiver inativa.
setInterval(() => {
  i = (i + 1) % THEMES.length; // Loop circular nos temas.
  applyTheme(i);
}, 3000);

