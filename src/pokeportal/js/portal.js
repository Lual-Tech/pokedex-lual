/*************** STORAGE KEYS (namespaced) ***************/
const AUTH_KEY       = 'pp:auth';
const VIEW_STATE_KEY = 'pp:view';
const FAVORITES_KEY  = 'pp:favorites';
const MIGRATION_OLD  = 'pokemonFavorites'; // migra favoritos da versão antiga, se existir

/*************** DOM ROOT ***************/
const appContainer = document.getElementById('app');

/*************** DADOS ***************/
const userProfile = { username:'Misty#01', level:35, levelProgress:75 };

const squirtleData = {
  id:'0007', name:'Squirtle', type:'Água',
  height:'0.5m', weight:'9.0kg', gender:'♂/♀',
  category:'Tartaruga', ability:'Torrente',
  weaknesses:[{name:'Elétrico', className:'badge-electric'},{name:'Planta', className:'badge-plant'}],
  resistances:[{name:'Fogo', className:'badge-fire'},{name:'Gelo', className:'badge-ice'}],
  description:'Squirtle é um Pokémon do tipo Água. Ele se esconde em sua concha quando se sente ameaçado e ataca soltando água com grande força.',
  stats:[
    {name:'Vida', value:44, max:255},{name:'Ataque', value:48, max:255},{name:'Defesa', value:65, max:255},
    {name:'Velocidade', value:43, max:255},{name:'Atq. Especial', value:50, max:255},{name:'Def. Especial', value:64, max:255},
  ],
  evolutions:[
    {id:'0007', name:'Squirtle',  imageUrl:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/7.svg', level:'Base'},
    {id:'0008', name:'Wartortle', imageUrl:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/8.svg', level:16},
    {id:'0009', name:'Blastoise', imageUrl:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/9.svg', level:36},
  ],
  imageUrl:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/7.svg'
};

/*************** FAVORITOS ***************/
(function migrateOldFavorites(){
  // migra favoritos da chave antiga (se houver)
  const old = localStorage.getItem(MIGRATION_OLD);
  if (!old) return;
  try{
    const cur = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    const legacy = JSON.parse(old) || [];
    const merged = Array.from(new Set([...(cur||[]), ...(legacy||[])]));
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(merged));
    localStorage.removeItem(MIGRATION_OLD);
  }catch{}
})();

const getFavorites = () => {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); }
  catch { return []; }
};
const isFavorite = (id) => getFavorites().includes(id);
const toggleFavorite = (id) => {
  const favs = new Set(getFavorites());
  const wasFav = favs.has(id);
  if (wasFav) favs.delete(id); else favs.add(id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
  alertMessage(`${squirtleData.name} ${wasFav ? 'removido dos' : 'adicionado aos'} favoritos!`);
  if (getCurrentView()==='pokemon') renderPokemonPage();
  if (getCurrentView()==='profile') renderProfilePage();
};

/*************** AUTH ***************/
const isLoggedIn = () => localStorage.getItem(AUTH_KEY) === 'true';
const loginUser   = () => { localStorage.setItem(AUTH_KEY,'true');  alertMessage('Login bem-sucedido!'); window.location.href = "/src/index.html"; };
const logoutUser  = () => { localStorage.setItem(AUTH_KEY,'false'); alertMessage('Logout realizado.');   setView('login'); };

/*************** HELPERS UI ***************/
const createBadge = (text, className) => {
  const isGradient = className.includes('badge-electric') || className.includes('badge-plant');
  return `<span class="px-3 py-1 text-sm font-semibold rounded-full ${className} whitespace-nowrap"
           style="${isGradient ? 'display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;' : ''}">
           ${text}
         </span>`;
};
const BackIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
</svg>`;
const HeartIcon = (isFilled) => {
  const color='var(--favorite-color)';
  const fill = isFilled ? color : 'none';
  const stroke = isFilled ? color : 'var(--branco)';
  return `<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 transition-colors duration-200" fill="${fill}" viewBox="0 0 24 24" stroke="${stroke}">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.11C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>`;
};
const alertMessage = (message) => {
  let box = document.getElementById('alert-box');
  if (!box){
    box = document.createElement('div');
    box.id='alert-box';
    box.className='fixed top-4 right-4 z-50 p-4 text-white rounded-lg shadow-xl transition-opacity duration-300 opacity-0';
    box.style.backgroundColor='var(--primary-action)';
    document.body.appendChild(box);
  }
  box.textContent = message;
  box.classList.remove('opacity-0'); box.classList.add('opacity-100');
  setTimeout(()=>{ box.classList.remove('opacity-100'); box.classList.add('opacity-0'); setTimeout(()=>box.remove(),300); }, 3000);
};

/*************** VIEWS ***************/
const getCurrentView = () => localStorage.getItem(VIEW_STATE_KEY) || 'login';
const setView = (v) => { localStorage.setItem(VIEW_STATE_KEY, v); renderApp(); };

/* LOGIN */
function renderLoginPage(){
  document.title='Login';
  appContainer.innerHTML = `
  <main class="w-full max-w-lg md:max-w-xl mx-auto p-8 rounded-xl shadow-2xl bg-card-dark border border-gray-700">
    <section class="text-center mb-8" aria-label="Área de Login">
      <h1 class="text-2xl font-bold mb-6">Faça login para continuar</h1>
      <div class="space-y-3">
        <button type="button" class="w-full flex items-center justify-center p-3 rounded-lg font-semibold border border-gray-600 bg-gray-700 hover:bg-gray-600 transition"
          style="background-color:var(--cinzaesc);border-color:var(--cinzaclaro);">
          <span class="mr-2"><svg viewBox="0 0 24 24" class="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M22.5 12.0003c0-.783-.07-1.53-.193-2.253H12v4.265h5.922c-.256 1.348-.962 2.593-2.073 3.498v2.71h3.492c2.052-1.895 3.259-4.708 3.259-8.22c0-.398-.035-.785-.098-1.163z" fill="#4285F4"/><path d="M12 22.5c3.048 0 5.602-1.006 7.469-2.71l-3.492-2.71c-.968.647-2.193 1.026-3.977 1.026-3.048 0-5.656-2.043-6.575-4.877H1.918v2.793C3.763 20.91 7.55 22.5 12 22.5z" fill="#34A853"/><path d="M5.425 14.243c-.225-.65-.35-1.346-.35-2.07c0-.724.125-1.42.35-2.07V7.38h-3.56c-.75 1.5-1.165 3.195-1.165 4.75 0 1.555.415 3.25 1.165 4.75l3.56-2.917z" fill="#FBBC04"/><path d="M12 4.417c1.674 0 3.18.577 4.364 1.745l3.097-3.097C17.602 1.334 15.048.5 12 .5c-4.45 0-8.237 1.59-10.082 4.417l3.56 2.917C6.344 6.46 8.952 4.417 12 4.417z" fill="#EA4335"/></svg></span>
          Continuar com o Google
        </button>
        <button type="button" class="w-full flex items-center justify-center p-3 rounded-lg font-semibold border border-gray-600 bg-gray-700 hover:bg-gray-600 transition"
          style="background-color:var(--cinzaesc);border-color:var(--cinzaclaro);">
          <span class="mr-2 text-xl"></span> Continuar com o Apple ID
        </button>
      </div>
      <div class="my-6 flex items-center">
        <hr class="flex-grow" style="border-color:var(--cinzaesc);">
        <span class="px-3 text-sm" style="color:var(--cinzaclaro);font-weight:500;">OU</span>
        <hr class="flex-grow" style="border-color:var(--cinzaesc);">
      </div>
    </section>
    <form id="login-form" aria-label="Formulário de Login com Credenciais">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Nome de usuário ou e-mail</label>
        <input type="text" id="username" required class="w-full p-3 rounded-lg input-dark" placeholder="usuario@email.com">
      </div>
      <div class="mb-4">
        <div class="flex justify-between items-center">
          <label class="block text-sm font-medium mb-1">Senha</label>
          <a href="#" id="forgot-password-link" class="text-xs hover:text-white transition" style="color:var(--primary-secondary);">Esqueceu a senha?</a>
        </div>
        <input type="password" id="password" required class="w-full p-3 rounded-lg input-dark" placeholder="******">
      </div>
      <button type="submit" class="w-full text-white font-bold py-3 rounded-lg transition shadow-lg mt-4 focus:outline-none focus:ring-4"
        style="background-color:var(--primary-action);box-shadow:var(--shadow-primary);--tw-ring-color:var(--primary-action);">
        Login
      </button>
    </form>
    <footer class="text-center mt-6 text-sm">
      Não possui uma conta?
      <a href="#" id="register-link" class="hover:underline" style="color:var(--primary-secondary);">Cadastre-se</a>
    </footer>
  </main>`;
  document.getElementById('login-form').addEventListener('submit', (e)=>{ e.preventDefault(); loginUser(); });
  document.getElementById('register-link').addEventListener('click', (e)=>{ e.preventDefault(); setView('register'); });
  document.getElementById('forgot-password-link').addEventListener('click', (e)=>{ e.preventDefault(); alertMessage('Função de recuperação de senha não implementada.'); });
  appContainer.querySelectorAll('button[type="button"]').forEach(btn=>btn.addEventListener('click', loginUser));
}

/* CADASTRO */
function renderRegisterPage(){
  document.title='Cadastrar Usuário';
  appContainer.innerHTML = `
  <main class="w-full max-w-lg md:max-w-xl mx-auto p-8 rounded-xl shadow-2xl bg-card-dark border" style="border-color:var(--cinzaesc);">
    <section class="text-center mb-8"><h1 class="text-2xl font-bold">Cadastrar Usuário</h1></section>
    <form id="register-form" aria-label="Formulário de Cadastro">
      <div class="mb-4"><label class="block text-sm font-medium mb-1">Nome de usuário</label><input type="text" id="name" required class="w-full p-3 rounded-lg input-dark" placeholder="Nome"></div>
      <div class="mb-4"><label class="block text-sm font-medium mb-1">E-mail</label><input type="email" id="email" required class="w-full p-3 rounded-lg input-dark" placeholder="usuario@gmail.com"></div>
      <div class="mb-4"><label class="block text-sm font-medium mb-1">Telefone</label><input type="tel" id="phone" required class="w-full p-3 rounded-lg input-dark" placeholder="(00) 0000-0000"></div>
      <div class="mb-4"><label class="block text-sm font-medium mb-1">Escolha sua senha</label><input type="password" id="reg-password" required class="w-full p-3 rounded-lg input-dark" placeholder="******"></div>
      <div class="mb-4"><label class="block text-sm font-medium mb-1">Confirme sua senha</label><input type="password" id="confirm-password" required class="w-full p-3 rounded-lg input-dark" placeholder="******"></div>
      <button type="submit" class="w-full text-white font-bold py-3 rounded-lg transition shadow-lg mt-4 focus:outline-none focus:ring-4"
        style="background-color:var(--primary-action);box-shadow:var(--shadow-primary);--tw-ring-color:var(--primary-action);">
        Criar conta
      </button>
    </form>
    <footer class="text-center mt-6 text-sm">Já possui uma conta?
      <a href="#" id="login-link" class="hover:underline" style="color:var(--primary-secondary);">Faça login</a>
    </footer>
  </main>`;
  document.getElementById('register-form').addEventListener('submit',(e)=>{
    e.preventDefault();
    const p1 = document.getElementById('reg-password').value.trim();
    const p2 = document.getElementById('confirm-password').value.trim();
    if (!p1 || p1!==p2){ alertMessage('Erro: Preencha todos os campos e certifique-se que as senhas coincidem.'); return; }
    alertMessage('Cadastro realizado com sucesso! Faça login.');
    setView('login');
  });
  document.getElementById('login-link').addEventListener('click', (e)=>{ e.preventDefault(); setView('login'); });
}

/* PERFIL */
function renderProfilePage(){
  document.title = `Perfil de Usuário - ${userProfile.username}`;
  const favorites = getFavorites();
  const isSquirtleFavorite = favorites.includes(squirtleData.id);
  const favoritesContent = isSquirtleFavorite
    ? `<button class="w-full p-3 rounded-lg flex items-center justify-between transition cursor-pointer"
         id="goto-pokemon-from-favorites" style="background-color:var(--card-dark);border:1px solid var(--primary-secondary);">
         <div class="flex items-center"><img src="${squirtleData.imageUrl}" alt="${squirtleData.name}" class="w-8 h-8 object-contain mr-3"><span class="font-medium">${squirtleData.name}</span></div>
         ${HeartIcon(true)}
       </button>`
    : `<p class="text-sm text-center py-4" style="color:var(--cinzaclaro);">Nenhum Pokémon favoritado ainda.</p>`;

  const cover = `
  <div class="h-40 relative overflow-hidden rounded-t-xl" style="background-color:var(--roxo);">
    <svg class="absolute top-1 right-1/2 translate-x-1/2 opacity-30 transform -translate-x-full h-40" viewBox="0 0 100 100">
      <path fill="var(--roxo)" d="M50 0C75 0 100 25 100 50C100 75 75 100 50 100C25 100 0 75 0 50C0 25 25 0 50 0Z" opacity=".8"/>
      <path fill="var(--cinzaclaro)" d="M40 45L60 45L60 55L40 55Z"/>
    </svg>
    <svg class="absolute top-1 left-1/2 translate-x-1/2 opacity-30 transform translate-x-full h-40" viewBox="0 0 100 100">
      <path fill="var(--roxo)" d="M50 0C75 0 100 25 100 50C100 75 75 100 50 100C25 100 0 75 0 50C0 25 25 0 50 0Z" opacity=".8"/>
      <path fill="var(--cinzaclaro)" d="M40 45L60 45L60 55L40 55Z"/>
    </svg>
  </div>`;

  const icon = (d)=>`<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" style="color:var(--primary-secondary);" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${d}"/></svg>`;

  appContainer.innerHTML = `
  <div class="w-full max-w-2xl md:max-w-4xl mx-auto rounded-xl shadow-2xl bg-card-dark border" style="border-color:var(--cinzaesc);">
    <header class="relative">
      ${cover}
      <div class="flex justify-center profile-img-container">
        <div class="profile-img flex items-center justify-center text-4xl font-extrabold"
             style="background-color:var(--roxo);color:var(--branco);border-color:var(--card-dark);">M</div>
      </div>
      <div class="text-center pt-2 pb-6"><h2 class="text-2xl font-bold">${userProfile.username}</h2></div>
    </header>

    <section class="px-8 pb-8 space-y-6">
      <div class="p-4 rounded-lg shadow-inner" style="background-color:var(--cinzaesc);">
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm font-medium" style="color:var(--cinzaclaro);">LEVEL ${userProfile.level}</span>
          <span class="text-xs" style="color:var(--cinzaclaro);">Progresso: ${userProfile.levelProgress}%</span>
        </div>
        <div class="w-full h-2 rounded-full overflow-hidden" style="background-color:var(--cinzaesc);">
          <div class="h-full rounded-full transition-all duration-500" style="background-color:var(--primary-action);width:${userProfile.levelProgress}%"></div>
        </div>
      </div>

      <div class="space-y-3">
        <a href="#" id="test-pokemon-link" class="flex items-center p-3 rounded-lg transition border"
           style="background-color:var(--card-dark);border-color:var(--primary-secondary);color:var(--primary-secondary);">
          ${icon('M 9 12 C 9 13.657 7.657 15 6 15 C 4.343 15 3 13.657 3 12 C 3 10.343 4.343 9 6 9 C 7.657 9 9 10.343 9 12 Z M 18 12 C 18 13.657 16.657 15 15 15 C 13.343 15 12 13.657 12 12 C 12 10.343 13.343 9 15 9 C 16.657 9 18 10.343 18 12 Z')}
          <span class="ml-4 font-medium text-white">Ver Detalhes do Pokémon</span>
        </a>

        <h3 class="text-lg font-bold mt-6 mb-2 flex items-center">
          ${icon('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.11C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z')}
          <span class="ml-2">Pokémon Favoritos</span>
        </h3>
        <div class="space-y-2">${favoritesContent}</div>
      </div>

      <hr style="border-color:var(--cinzaesc);">

      <div class="space-y-3">
        <a href="#" class="flex items-center p-3 rounded-lg hover:bg-gray-800 transition" id="language-setting">
          ${icon('M 12 12 C 12 12 12 12 12 12 M 12 12 C 12 12 12 12 12 12 M 12 4 L 4 12 L 12 20 M 12 4 L 20 12 L 12 20')}
          <span class="ml-4 font-medium flex-grow">Idioma</span><span class="text-sm" style="color:var(--cinzaclaro);">Português</span>
        </a>
        <a href="#" class="flex items-center p-3 rounded-lg hover:bg-gray-800 transition" id="support-setting">
          ${icon('M 8 10 L 16 10 M 8 14 L 16 14 M 4 4 H 20 V 20 H 4 Z')}
          <span class="ml-4 font-medium">Suporte</span>
        </a>
        <a href="#" class="flex items-center p-3 rounded-lg hover:bg-gray-800 transition" id="privacy-setting">
          ${icon('M 12 17 C 14.761 17 17 14.761 17 12 C 17 9.239 14.761 7 12 7 C 9.239 7 7 9.239 7 12 C 7 14.761 9.239 17 12 17 Z M 12 14 C 13.104 14 14 13.104 14 12 C 14 10.896 13.104 10 12 10 C 10.896 10 10 10.896 10 12 C 10 13.104 10.896 14 12 14 Z')}
          <span class="ml-4 font-medium">Política de Privacidade</span>
        </a>
      </div>

      <button id="logout-button" class="w-full text-white font-bold py-3 rounded-lg transition shadow-lg focus:outline-none focus:ring-4"
        style="background-color:var(--verm);--tw-ring-color:var(--verm);">
        Sair da Conta
      </button>
    </section>
  </div>`;

  document.getElementById('logout-button').addEventListener('click', logoutUser);
  document.getElementById('test-pokemon-link').addEventListener('click', (e)=>{ e.preventDefault(); setView('pokemon'); });

  const gotoPokemonFromFavorites = document.getElementById('goto-pokemon-from-favorites');
  if (gotoPokemonFromFavorites) {
    gotoPokemonFromFavorites.addEventListener('click', (e)=>{ e.preventDefault(); setView('pokemon'); });
  }
  document.getElementById('language-setting').addEventListener('click', (e)=>{ e.preventDefault(); alertMessage('Configuração de Idioma não implementada.'); });
  document.getElementById('support-setting').addEventListener('click', (e)=>{ e.preventDefault(); alertMessage('Tela de Suporte não implementada.'); });
  document.getElementById('privacy-setting').addEventListener('click', (e)=>{ e.preventDefault(); alertMessage('Política de Privacidade não implementada.'); });
}

/* POKÉMON */
function renderPokemonAboutTab(p){
  const Detail = (label,value)=>`
    <div class="flex flex-col text-center">
      <span class="text-xs font-semibold uppercase" style="color:var(--cinzaclaro);">${label}</span>
      <span class="text-sm font-bold mt-1">${value}</span>
    </div>`;
  const weaknesses = p.weaknesses.map(w=>createBadge(w.name,w.className)).join('');
  const resistances = p.resistances.map(r=>createBadge(r.name,r.className)).join('');
  return `
    <div class="flex items-center justify-center pt-4">${createBadge(p.type,'pokemon-badge-type')}</div>
    <p class="text-base text-center leading-relaxed">${p.description}</p>
    <div class="p-6 rounded-lg grid grid-cols-2 gap-y-4 gap-x-6 text-sm" style="background-color:var(--cinzaesc);">
      ${Detail('Altura',p.height)}${Detail('Peso',p.weight)}${Detail('Categoria',p.category)}${Detail('Habilidade',p.ability)}${Detail('Gênero',p.gender)}
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div class="flex flex-col items-start"><h3 class="text-lg font-bold mb-3">Fraquezas</h3><div class="flex flex-wrap gap-2 justify-start">${weaknesses}</div></div>
      <div class="flex flex-col items-start"><h3 class="text-lg font-bold mb-3">Resistências</h3><div class="flex flex-wrap gap-2 justify-start">${resistances}</div></div>
    </div>`;
}
function renderPokemonStatusTab(p){
  const line = (stat)=>{
    const pct = (stat.value/stat.max)*100;
    return `<div class="flex items-center space-x-4 py-2 border-b last:border-b-0" style="border-color:var(--cinzaesc);">
      <div class="text-sm font-semibold w-24 shrink-0" style="color:var(--cinzaclaro);">${stat.name}</div>
      <div class="text-sm font-bold w-12 text-right shrink-0">${stat.value}</div>
      <div class="w-full h-2 rounded-full overflow-hidden" style="background-color:var(--cinzaesc);">
        <div class="h-full rounded-full transition-all duration-500" style="background-color:var(--stat-bar-color);width:${pct.toFixed(1)}%"></div>
      </div>
    </div>`;
  };
  return `<div class="w-full max-w-lg mx-auto pt-4">${p.stats.map(line).join('')}
    <p class="text-xs text-center mt-4" style="color:var(--cinzaclaro);">Valores de Status Base. (Máximo: ${p.stats[0].max})</p></div>`;
}
function renderPokemonEvolutionsTab(p){
  const evos = p.evolutions.map((evo,i,arr)=>{
    const isCurrent = evo.id===p.id;
    const border = isCurrent ? 'var(--primary-secondary)' : 'transparent';
    const block = `
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 rounded-full p-1 flex items-center justify-center border-2" style="background-color:var(--cinzaesc);border-color:${border}">
          <img src="${evo.imageUrl}" alt="${evo.name}" class="w-full h-full object-contain" onerror="this.src='https://placehold.co/60x60/cccccc/333333?text=N/A'">
        </div>
        <div class="flex-grow">
          <span class="text-xs" style="color:var(--cinzaclaro);">#${evo.id}</span>
          <h4 class="text-lg font-bold">${evo.name}</h4>
        </div>
      </div>`;
    if (i < arr.length-1){
      const next = arr[i+1];
      return block + `
        <div class="flex flex-col items-center py-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" style="color:var(--cinzaclaro);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
          </svg>
          <span class="text-xs font-medium mt-1" style="color:var(--cinzaclaro);">Nível ${next.level}</span>
        </div>`;
    }
    return block;
  }).join('');
  return `<div class="w-full max-w-sm mx-auto pt-4 space-y-4"><h3 class="text-xl font-bold text-center mb-6">Cadeia Evolutiva</h3>${evos}</div>`;
}

function renderPokemonPage(){
  const p = squirtleData;
  document.title = `${p.name} #${p.id}`;
  const favorited = isFavorite(p.id);

  appContainer.innerHTML = `
  <div class="w-full max-w-2xl md:max-w-4xl mx-auto rounded-xl shadow-lg pokemon-card border overflow-hidden" style="border-color:var(--cinzaesc);">
    <header class="relative p-6 pokemon-header min-h-[250px] flex flex-col justify-between">
      <div class="flex justify-between items-center z-10">
        <button id="back-to-profile" class="p-2 -ml-2 rounded-full hover:bg-black/10 transition" aria-label="Voltar">
          ${BackIcon}
        </button>
        <div class="flex items-center space-x-4">
          <div class="text-right">
            <span class="text-sm font-light" style="color:var(--pokemon-accent-text);">#${p.id}</span>
            <h1 class="text-3xl font-extrabold tracking-wider">${p.name.toUpperCase()}</h1>
          </div>
          <button id="favorite-button" class="p-2 -mr-2 rounded-full hover:bg-black/10 transition transform hover:scale-110">
            ${HeartIcon(favorited)}
          </button>
        </div>
      </div>
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 flex items-end justify-center z-0">
        <img src="${p.imageUrl}" alt="${p.name}" class="w-full h-full object-contain drop-shadow-xl">
      </div>
    </header>

    <div class="p-8 space-y-8 rounded-b-xl" style="background-color:var(--card-dark);">
      <nav id="pokemon-nav-tabs" class="flex justify-around border-b -mt-2" style="border-color:var(--cinzaesc);">
        <a href="#" data-tab="about" class="flex-1 py-3 font-bold border-b-2 pokemon-tab-active">SOBRE</a>
        <a href="#" data-tab="status" class="flex-1 py-3 font-semibold border-b-2 border-transparent pokemon-tab">STATUS</a>
        <a href="#" data-tab="evolucoes" class="flex-1 py-3 font-semibold border-b-2 border-transparent pokemon-tab">EVOLUÇÕES</a>
      </nav>
      <div id="pokemon-tab-content" class="min-h-[300px]"></div>
    </div>

    <footer class="sticky bottom-0 border-t p-3 flex justify-around rounded-b-xl z-20" style="background-color:var(--preto);border-color:var(--cinzaesc);">
      <button class="flex flex-col items-center bottom-nav-icon hover:text-white transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 9V20H21V9L12 2Z"/></svg>
        <span class="text-xs mt-1">Home</span>
      </button>
      <button class="flex flex-col items-center bottom-nav-icon active">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4ZM12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z"/></svg>
        <span class="text-xs mt-1">Pokédex</span>
      </button>
      <button class="flex flex-col items-center bottom-nav-icon hover:text-white transition" id="bottom-nav-profile">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/></svg>
        <span class="text-xs mt-1">Perfil</span>
      </button>
    </footer>
  </div>`;

  // tabs
  const tabArea = document.getElementById('pokemon-tab-content');
  const navTabs = document.getElementById('pokemon-nav-tabs');
  const switchTab = (tab)=>{
    navTabs.querySelectorAll('a').forEach(link=>{
      const active = link.dataset.tab===tab;
      link.classList.toggle('pokemon-tab-active', active);
      link.classList.toggle('pokemon-tab', !active);
      link.classList.toggle('font-bold', active);
      link.classList.toggle('font-semibold', !active);
    });
    tabArea.innerHTML =
      tab==='status'   ? renderPokemonStatusTab(p) :
      tab==='evolucoes'? renderPokemonEvolutionsTab(p) :
                         renderPokemonAboutTab(p);
  };
  navTabs.querySelectorAll('a').forEach(link=>{
    link.addEventListener('click',(e)=>{ e.preventDefault(); switchTab(link.dataset.tab); });
  });
  switchTab('about');

  // ações
  document.getElementById('back-to-profile').addEventListener('click', (e)=>{ e.preventDefault(); setView('profile'); });
  document.getElementById('bottom-nav-profile').addEventListener('click', (e)=>{ e.preventDefault(); setView('profile'); });
  document.getElementById('favorite-button').addEventListener('click', ()=>toggleFavorite(p.id));
}

/*************** APP SHELL ***************/
function renderApp(){
  let view = getCurrentView();
  if (isLoggedIn()){
    if (view==='login' || view==='register'){ view='profile'; localStorage.setItem(VIEW_STATE_KEY,'profile'); }
  } else {
    if (view!=='register'){ view='login'; }
  }
  if (view==='profile') return renderProfilePage();
  if (view==='register') return renderRegisterPage();
  if (view==='pokemon') return renderPokemonPage();
  renderLoginPage();
}

window.addEventListener('load', renderApp);