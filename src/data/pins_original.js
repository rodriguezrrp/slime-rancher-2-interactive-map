const plorts = [
  "Pink", 
  "Tabby", 
  "Rock", 
  "Ringtail", 
  "Phosphor", 
  "Hunter", 
  "Honey", 
  "Flutter", 
  "Crystal", 
  "Cotton", 
  "Boom", 
  "Batty", 
  "Angler",
  "Dervish",
  "Fire",
  "Gold",
  "Mosaic",
  "Puddle",
  "Quantum",
  "Rad",
  "Saber",
  "Tangle",
]
const slimes = [
  "Pink", 
  "Tabby", 
  "Rock", 
  "Ringtail", 
  "Phosphor", 
  "Hunter", 
  "Honey", 
  "Flutter", 
  "Crystal", 
  "Cotton", 
  "Boom", 
  "Batty", 
  "Angler",
  "Dervish",
  "Fire",
  "Gold",
  "Mosaic",
  "Puddle",
  "Quantum",
  "Rad",
  "Saber",
  "Tangle",
  "Lucky",
  "Tarr",
  "Glitch"
]
const resources = [
  "BuzzWax", 
  "DeepBrine", 
  "Hexacomb", 
  "Indigonium", 
  "JellyStone", 
  "LavaDust", 
  "PepperJam", 
  "PrimordyOil", 
  "RadiantOre", 
  "SilkySand", 
  "SlimeFossil", 
  "SpiralSteam", 
  "StrangeDiamond", 
  "WildHoney"
];

export const pins = {
  Veggie: {
    name: 'Veggie',
    type: 'Food',
    icon: 'Pins/iconVeggieCarrot.png',
  },
  Fruit: {
    name: 'Fruit',
    type: 'Food',
    icon: 'Pins/iconFruitCuberry.png',
  },
  Animal: {
    name: 'Animal',
    type: 'Food',
    icon: 'Pins/iconBirdHen.png',
  },
  Cross: {
    name: 'Cross',
    type: 'Utility',
    icon: 'Pins/xMark.png',
  },
  'Question Mark': {
    name: 'Question Mark',
    type: 'Utility',
    icon: 'lockedIcon.png',
  },
  'Map Node': {
    name: 'Map Node',
    type: 'Utility',
    icon: 'iconMapNode.png',
  },
  'Treasure Pod': {
    name: 'Treasure Pod',
    type: 'Utility',
    icon: 'iconTreasurePod.png',
  },
  'Research Drone': {
    name: 'Research Drone',
    type: 'Utility',
    icon: 'researchDroneFaceIcon.png',
  },
  "Nectar": {
    name: "Nectar",
    type: "Food",
    icon: "iconCategoryNectar.png"
  }
};

plorts.forEach((plort) => {
  pins[`${plort} Plort`] = {
    name: `${plort} Plort`,
    type: "Plorts",
    icon: `Plort/iconPlort${plort}.png`
  }
})

slimes.forEach((slime) => {
  pins[`${slime}`] = {
    name: `${slime}`,
    type: "Slimes",
    icon: `Slimes/iconSlime${slime}.png`
  }
})

resources.forEach(resource => {
  pins[`${resource}`] = {
    name: `${resource}`,
    type: "Resources",
    icon: `Resources/iconCraft${resource}.png`
  }
})
