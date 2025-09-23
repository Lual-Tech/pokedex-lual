// pokemon.js

const squirtle = {
  id: 7,
  name: "squirtle",
  height: 5, // altura 0.5m
  weight: 90, // peso 9.0kg
  types: [
    { slot: 1, type: { name: "water", url: "https://pokeapi.co/api/v2/type/11/" } }
  ],
  abilities: [
    { ability: { name: "torrent", url: "https://pokeapi.co/api/v2/ability/67/" }, is_hidden: false, slot: 1 },
    { ability: { name: "rain-dish", url: "https://pokeapi.co/api/v2/ability/44/" }, is_hidden: true, slot: 3 }
  ],
  stats: [
    { base_stat: 44, effort: 0, stat: { name: "hp", url: "https://pokeapi.co/api/v2/stat/1/" } },
    { base_stat: 48, effort: 0, stat: { name: "attack", url: "https://pokeapi.co/api/v2/stat/2/" } },
    { base_stat: 65, effort: 1, stat: { name: "defense", url: "https://pokeapi.co/api/v2/stat/3/" } },
    { base_stat: 50, effort: 0, stat: { name: "special-attack", url: "https://pokeapi.co/api/v2/stat/4/" } },
    { base_stat: 64, effort: 1, stat: { name: "special-defense", url: "https://pokeapi.co/api/v2/stat/5/" } },
    { base_stat: 43, effort: 0, stat: { name: "speed", url: "https://pokeapi.co/api/v2/stat/6/" } }
  ],
  sprites: {
    front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"
  }
};
