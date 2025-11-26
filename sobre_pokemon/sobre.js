let currentPokemonId = 1;
const STORAGE_KEY = 'pokedex:favs';

const typeColors = { normal:'#A8A77A', fire:'#EE8130', water:'#6390F0', electric:'#F7D02C', grass:'#7AC74C', ice:'#96D9D6', fighting:'#C22E28', poison:'#A33EA1', ground:'#E2BF65', flying:'#A98FF3', psychic:'#F95587', bug:'#A6B91A', rock:'#B6A136', ghost:'#735797', dragon:'#6F35FC', dark:'#705746', steel:'#B7B7CE', fairy:'#D685AD' };
const typeTranslation = { normal:'Normal', fire:'Fogo', water:'Água', electric:'Elétrico', grass:'Planta', ice:'Gelo', fighting:'Luta', poison:'Veneno', ground:'Terra', flying:'Voador', psychic:'Psíquico', bug:'Inseto', rock:'Pedra', ghost:'Fantasma', dragon:'Dragão', dark:'Sombrio', steel:'Aço', fairy:'Fada' };
const statsTranslation = { hp:'HP', attack:'ATQ', defense:'DEF', 'special-attack':'SP. ATQ', 'special-defense':'SP. DEF', speed:'VEL' };

lucide.createIcons();
document.addEventListener('DOMContentLoaded', () => { 
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString); 
    currentPokemonId = urlParams.get('id'); 
    if(!currentPokemonId){
        currentPokemonId = 1;
    }
    loadPokemon(currentPokemonId); 
    updateFavoriteButtonUI(); 
    document.getElementById('btn-favorite').addEventListener('click', toggleFavorite); 
});

function handleSearch(event) {
    event.preventDefault();
    const input = document.getElementById('search-input');
    const term = input.value.trim().toLowerCase();
    if(term) { loadPokemon(term); input.blur(); }
}

async function loadPokemon(identifier) {
    const overlay = document.getElementById('loading-overlay');
    const errorState = document.getElementById('error-state');
    
    overlay.classList.remove('hidden');
    overlay.classList.remove('opacity-0');
    errorState.classList.add('hidden');

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
        if (!response.ok) throw new Error('Pokemon não encontrado');
        
        const data = await response.json();
        currentPokemonId = data.id;

        document.getElementById('poke-name').innerText = data.name;
        document.getElementById('poke-id').innerText = `#${String(data.id).padStart(4, '0')}`;
        
        const imgUrl = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
        document.getElementById('poke-image').src = imgUrl;

        document.getElementById('poke-height').innerText = `${data.height / 10}m`;
        document.getElementById('poke-weight').innerText = `${data.weight / 10}kg`;
        document.getElementById('poke-main-ability').innerText = data.abilities[0].ability.name.replace('-', ' ');

        const primaryType = data.types[0].type.name;
        const primaryColor = typeColors[primaryType] || '#777';
        document.getElementById('poke-bg-circle').style.backgroundColor = primaryColor;
        document.querySelector('.loader').style.color = primaryColor;

        renderTypes(data.types);
        renderAbilities(data.abilities);
        renderStats(data.stats, primaryColor);

        await fetchTypeData(data.types[0].type.url);

        updateFavoriteButtonUI();

    } catch (error) {
        console.error(error);
        errorState.classList.remove('hidden');
    } finally {
        setTimeout(() => { 
            overlay.classList.add('opacity-0');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        }, 500);
    }
}

function renderTypes(types) {
    const container = document.getElementById('types-container');
    container.innerHTML = '';
    types.forEach(t => {
        const typeName = t.type.name;
        const color = typeColors[typeName] || '#777';
        const badge = document.createElement('span');
        badge.className = 'px-3 py-1 rounded-lg text-[10px] font-bold uppercase shadow-sm flex items-center gap-1 transform hover:scale-105 transition';
        badge.style.backgroundColor = color;
        badge.style.color = isLight(color) ? '#000' : '#FFF';
        badge.innerText = typeTranslation[typeName] || typeName;
        container.appendChild(badge);
    });
}

function renderStats(stats, color) {
    const container = document.getElementById('stats-container');
    container.innerHTML = '';
    stats.forEach(s => {
        const statName = statsTranslation[s.stat.name] || s.stat.name;
        const value = s.base_stat;
        const percentage = Math.min((value / 150) * 100, 100);
        
        const statRow = document.createElement('div');
        statRow.className = 'flex items-center gap-3 text-xs group';
        statRow.innerHTML = `
            <span class="w-12 text-gray-500 font-bold text-right uppercase text-[10px] tracking-wider group-hover:text-white transition">${statName}</span>
            <span class="w-8 font-bold text-right text-gray-300">${value}</span>
            <div class="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div class="stat-bar-fill h-full rounded-full" style="width: 0%; background-color: ${color}; box-shadow: 0 0 10px ${color}40;"></div>
            </div>
        `;
        container.appendChild(statRow);
        setTimeout(() => { statRow.querySelector('.stat-bar-fill').style.width = `${percentage}%`; }, 100);
    });
}

function renderAbilities(abilities) {
    const list = document.getElementById('abilities-list');
    list.innerHTML = '';
    abilities.forEach(ab => {
        const item = document.createElement('div');
        item.className = 'bg-[#1E1E1E] p-3 rounded-xl flex items-center justify-between border border-gray-800 hover:border-gray-600 transition';
        const isHidden = ab.is_hidden 
            ? '<span class="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/50 uppercase tracking-wider">Oculta</span>' 
            : '<span class="text-[9px] bg-gray-700 text-gray-400 px-2 py-1 rounded uppercase tracking-wider">Normal</span>';
        item.innerHTML = `<div><h4 class="font-bold text-sm capitalize text-gray-200">${ab.ability.name.replace('-', ' ')}</h4></div>${isHidden}`;
        list.appendChild(item);
    });
}

async function fetchTypeData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        renderChips('weakness-container', data.damage_relations.double_damage_from);
        renderChips('resistance-container', data.damage_relations.half_damage_from);
    } catch (e) { console.error('Erro ao carregar tipos', e); }
}

function renderChips(containerId, typesList) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (!typesList || typesList.length === 0) { 
        container.innerHTML = '<span class="text-gray-600 text-[10px] italic">Nenhum</span>'; 
        return; 
    }
    
    typesList.forEach(t => {
        const typeName = t.name;
        const color = typeColors[typeName] || '#555';
        const chip = document.createElement('div');
        chip.className = 'px-3 py-1 rounded-md text-[10px] font-bold shadow-sm flex items-center justify-center';
        chip.style.backgroundColor = color;
        chip.style.color = isLight(color) ? '#000' : '#FFF';
        chip.innerText = typeTranslation[typeName] || typeName;
        container.appendChild(chip);
    });
}

function changePokemon(direction) {
    let newId = currentPokemonId + direction;
    if (newId < 1) newId = 1025; 
    if (newId > 1025) newId = 1; 
    loadPokemon(newId);
}

function switchTab(tabName) {
    ['sobre', 'status', 'habilidades'].forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        const view = document.getElementById(`view-${t}`);
        if (t === tabName) {
            btn.className = "tab-active pb-2 text-sm font-medium tracking-wider w-1/3 transition-colors hover:text-white";
            view.classList.remove('hidden');
        } else {
            btn.className = "tab-inactive pb-2 text-sm font-medium tracking-wider w-1/3 transition-colors hover:text-white";
            view.classList.add('hidden');
        }
    });
}

function getFavorites() { const stored = localStorage.getItem(STORAGE_KEY); return stored ? JSON.parse(stored) : []; }
function toggleFavorite() {
    const favorites = getFavorites();
    const index = favorites.indexOf(currentPokemonId);
    if (index === -1) favorites.push(currentPokemonId);
    else favorites.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    updateFavoriteButtonUI();
}
function updateFavoriteButtonUI() {
    const favorites = getFavorites();
    const icon = document.getElementById('icon-heart');
    const btn = document.getElementById('btn-favorite');
    if (favorites.includes(currentPokemonId)) {
        icon.classList.add('fill-red-500', 'text-red-500');
        icon.classList.remove('text-white');
        btn.classList.add('bg-white/20');
    } else {
        icon.classList.remove('fill-red-500', 'text-red-500');
        icon.classList.add('text-white');
        btn.classList.remove('bg-white/20');
    }
}
function checkFavorites() {
    const favorites = getFavorites();
    if(favorites.length === 0) return alert("Você ainda não tem favoritos!");
    alert(`Seus IDs Favoritos: ${favorites.join(', ')}`);
}

function openProfile() {
    alert("Funcionalidade de Perfil em breve!");
}

function isLight(colorHex) {
    const hex = colorHex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000 > 155;
}

function playSound() {
    const img = document.getElementById('poke-image');
    img.style.transform = "scale(1.2) rotate(5deg)";
    setTimeout(() => img.style.transform = "", 200);
}