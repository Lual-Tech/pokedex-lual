const POKEDEX_DATA = {
    '0007': {
        id: '0007',
        name: 'Squirtle',
        imageUrl: 'https://placehold.co/150x150/C0F6FA/03A4E8?text=Squirtle%20%230007',
        evolutions: [
            { id: '0008', name: 'Wartortle', level: 16, number: '#0008', imageUrl: 'https://placehold.co/60x60/03a4e8/ffffff?text=Wartortle' },
            { id: '0009', name: 'Blastoise', level: 36, number: '#0009', imageUrl: 'https://placehold.co/60x60/03a4e8/ffffff?text=Blastoise' },
        ]
    },
    '0008': {
        id: '0008',
        name: 'Wartortle',
        imageUrl: 'https://placehold.co/150x150/C0F6FA/03A4E8?text=Wartortle%20%230008',
        evolutions: [
            { id: '0007', name: 'Squirtle', level: 0, number: '#0007', imageUrl: 'https://placehold.co/60x60/03a4e8/ffffff?text=Squirtle' },
            { id: '0009', name: 'Blastoise', level: 36, number: '#0009', imageUrl: 'https://placehold.co/60x60/03a4e8/ffffff?text=Blastoise' },
        ]
    },
    '0009': {
        id: '0009',
        name: 'Blastoise',
        imageUrl: 'https://placehold.co/150x150/C0F6FA/03A4E8?text=Blastoise%20%230009',
        evolutions: [
            { id: '0007', name: 'Squirtle', level: 0, number: '#0007', imageUrl: 'https://placehold.co/60x60/03a4e8/ffffff?text=Squirtle' },
            { id: '0008', name: 'Wartortle', level: 16, number: '#0008', imageUrl: 'https://placehold.co/60x60/03a4e8/ffffff?text=Wartortle' },
        ]
    }
};

let currentPokemonId;

function saveState(pokemonId) {
    localStorage.setItem('currentPokemonId', pokemonId);
}

function loadState() {
    const savedId = localStorage.getItem('currentPokemonId');
    return savedId && POKEDEX_DATA[savedId] ? savedId : '0007';
}

function renderMainPokemon(pokemonData) {
    const nameEl = document.getElementById('main-pokemon-name');
    const numberEl = document.getElementById('main-pokemon-number');
    const imageEl = document.getElementById('main-pokemon-image');

    nameEl.textContent = pokemonData.name;
    numberEl.textContent = `#${pokemonData.id}`;
    imageEl.src = pokemonData.imageUrl;
    imageEl.alt = `Imagem de ${pokemonData.name}`;
}

function renderEvolutions(pokemonData) {
    const listEl = document.getElementById('evolutions-list');
    listEl.innerHTML = '';

    const currentEvolutionEl = createEvolutionCard(pokemonData.id, pokemonData.name, `Nvl ${pokemonData.level || 0}`, `#${pokemonData.id}`, pokemonData.imageUrl, true);
    listEl.appendChild(currentEvolutionEl);
    listEl.appendChild(createEvolutionSeparator());

    pokemonData.evolutions.forEach(evo => {
        const cardEl = createEvolutionCard(evo.id, evo.name, `Nvl ${evo.level}`, evo.number, evo.imageUrl, false);
        listEl.appendChild(cardEl);
        listEl.appendChild(createEvolutionSeparator());
    });

    if (listEl.lastChild) listEl.removeChild(listEl.lastChild);
}

function createEvolutionSeparator() {
    const separator = document.createElement('div');
    separator.innerHTML = `
        <div class="flex justify-center my-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500 transform rotate-90 md:rotate-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 12.586V7z" clip-rule="evenodd" />
            </svg>
        </div>`;
    return separator.firstChild;
}

function createEvolutionCard(id, name, levelText, numberText, imageUrl, isCurrent) {
    const card = document.createElement('div');
    card.classList.add('evolution-card', 'p-4', 'rounded-lg', 'flex', 'items-center', 'space-x-4', 'transition-all', 'shadow-lg');
    card.setAttribute('data-pokemon-id', id);

    if (!isCurrent) {
        card.classList.add('cursor-pointer', 'bg-gray-800/70', 'hover:bg-indigo-600/70');
        card.addEventListener('click', () => changePokemon(id));
    } else {
        card.classList.add('evolution-card-current');
    }

    card.innerHTML = `
        <figure class="w-16 h-16 flex-shrink-0 evolution-img-container rounded-lg flex items-center justify-center p-1">
            <img src="${imageUrl}" alt="${name}" class="w-full h-full object-contain">
        </figure>
        <div class="flex-grow">
            <p class="text-sm text-gray-400 font-medium">${levelText.replace('Nvl 0', 'Base')}</p>
            <h3 class="text-lg font-semibold text-white">${name}</h3>
        </div>
        <div class="text-right flex-shrink-0">
            <p class="text-sm font-light text-gray-500">${numberText}</p>
        </div>`;
    return card;
}

function renderApp(newPokemonId) {
    currentPokemonId = newPokemonId || loadState();
    const pokemonData = POKEDEX_DATA[currentPokemonId];

    if (!pokemonData) {
        currentPokemonId = '0007';
        return renderApp();
    }

    saveState(currentPokemonId);
    renderMainPokemon(pokemonData);
    renderEvolutions(pokemonData);
}

function changePokemon(pokemonId) {
    if (pokemonId !== currentPokemonId) renderApp(pokemonId);
}

document.addEventListener('DOMContentLoaded', () => renderApp());
