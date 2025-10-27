// Loop de herói com SVGs locais e gradientes
const THEMES = [
  { name:'Squirtle',   grad:'var(--azulgrad)',  hero:'../public/img/squirtle.svg' },
  { name:'Bulbasaur',  grad:'var(--verdegrad)', hero:'../public/img/bulba.svg' },
  { name:'Jigglypuff', grad:'var(--rosagrad)',  hero:'../public/img/jiggly.svg' },
  { name:'Charmander', grad:'var(--largrad)',   hero:'../public/img/chari.svg' },
  { name:'Sprigatito', grad:'var(--verdegrad)', hero:'../public/img/sprigatito.svg' }
];

const bgA=document.getElementById('bgA'), bgB=document.getElementById('bgB');
const pokeA=document.getElementById('pokeA'), pokeB=document.getElementById('pokeB');
const pokeRegion=document.querySelector('.pokemon');
let i=0, useA=true;

function applyTheme(idx){
  const t = THEMES[idx%THEMES.length];
  const show=useA?bgB:bgA, hide=useA?bgA:bgB;
  show.style.background=t.grad; show.classList.add('show'); hide.classList.remove('show');
  const pShow=useA?pokeB:pokeA, pHide=useA?pokeA:pokeB;
  pShow.style.backgroundImage=`url('${t.hero}')`; pShow.classList.add('show','float'); pHide.classList.remove('show','float');
  pokeRegion.setAttribute('aria-label', t.name);
  useA=!useA;
}
applyTheme(0);
setInterval(()=>{ i=(i+1)%THEMES.length; applyTheme(i); },3000);
