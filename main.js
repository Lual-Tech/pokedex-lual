const Pokemon= {
  id: 0,
  name: "",
  base_experience: 0,
  height: 0, 
  weight: 0,

  abilities: [
    {
      is_hidden: false,
      slot: 1,
      ability: { name: "", url: "" }
    }
  ],

  stats: [
    {
      base_stat: 0,
      effort: 0,
      stat: { name: "hp|attack|defense|special-attack|special-defense|speed", url: "" }
    }
  ],

  types: [
    {
      slot: 1,
      type: { name: "", url: "" } 
    }
  ],

  sprites: {
    front_default: "", 
    back_default: ""
  },

  species: { name: "", url: "" } 
};
