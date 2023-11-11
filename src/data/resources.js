const data = [
  {
    type: 'PrimordyOil',
    position: [71.45837609354214, 40.39770654329147],
  },
  {
    type: 'PrimordyOil',
    position: [70.79488190285859, 41.14016334623738],
  },
  {
    type: 'PrimordyOil',
    position: [69.78917375688667, 42.7720215277122],
  },
  {
    type: 'PrimordyOil',
    position: [70.39780215287101, 46.37603059201208],
  },
  {
    type: 'PrimordyOil',
    position: [70.30860084710433, 50.77663393447267],
  },
  {
    type: 'PrimordyOil',
    position: [68.98423985119854, 48.819950901709],
  },
  {
    type: 'PrimordyOil',
    position: [68.58520303575413, 48.990097252384096],
  },
  {
    type: 'PrimordyOil',
    position: [67.68791549624565, 59.18341044282881],
  },
  {
    type: 'PrimordyOil',
    position: [66.6576555368632, 44.87564913605892],
  },
  {
    type: 'PrimordyOil',
    position: [65.65769762041285, 36.44567085261071],
  },
  {
    type: 'PrimordyOil',
    position: [68.3488439429382, 31.279408932112172],
  },
  {
    type: 'PrimordyOil',
    position: [67.5817386371699, 27.57485884241337],
  },
  {
    type: 'PrimordyOil',
    position: [66.96045852437382, 26.66225568879237],
  },
  {
    type: 'LavaDust',
    position: [66.69858762852853, 26.66225568879237],
  },
  {
    type: 'LavaDust',
    position: [67.89202300593327, 25.200543857992635],
  },
  {
    type: 'LavaDust',
    position: [67.67974903758336, 29.88730242658861],
  },
  {
    type: 'LavaDust',
    position: [67.09133232125879, 29.80222925125106],
  },
  {
    type: 'LavaDust',
    position: [66.46112632578036, 29.299524124256443],
  },
  {
    type: 'LavaDust',
    position: [65.82178319485685, 30.3513379284298],
  },
  {
    type: 'LavaDust',
    position: [65.61666668075509, 31.843985459352275],
  },
  {
    type: 'LavaDust',
    position: [68.53631294803127, 35.9893692758002],
  },
  {
    type: 'LavaDust',
    position: [68.38960574627139, 38.71171088660183],
  },
  {
    type: 'LavaDust',
    position: [67.85937279387134, 35.94296572561609],
  },
  {
    type: 'LavaDust',
    position: [66.62490700351711, 36.94064205457464],
  },
  {
    type: 'LavaDust',
    position: [66.706773569664, 35.54853554905108],
  },
  {
    type: 'SilkySand',
    position: [64.94322106087759, 55.502062128222065],
  },
  {
    type: 'SilkySand',
    position: [65.98580736199249, 44.28787083372675],
  },
  {
    type: 'SilkySand',
    position: [65.780767541889, 46.20588424133698],
  },
  {
    type: 'SilkySand',
    position: [65.84639074483795, 48.363649324898496],
  },
  {
    type: 'SilkySand',
    position: [66.27270063625497, 52.09913511472005],
  },
  {
    type: 'SilkySand',
    position: [66.64946864170261, 56.15944575583042],
  },
  {
    type: 'SilkySand',
    position: [68.58520303575413, 55.888758379756396],
  },
  {
    type: 'SilkySand',
    position: [68.69111035587821, 53.95527712208478],
  },
  {
    type: 'SilkySand',
    position: [68.99237912543177, 57.11071853460486],
  },
  {
    type: 'JellyStone',
    position: [68.48741669600965, 125.37807478047398],
  },
  {
    type: 'JellyStone',
    position: [65.76436020753509, 127.28062033802286],
  },
  {
    type: 'JellyStone',
    position: [63.67579061973921, 97.14924841846852],
  },
  {
    type: 'JellyStone',
    position: [64.58144799459477, 91.91338117269379],
  },
  {
    type: 'JellyStone',
    position: [66.33005637285211, 94.90641015956945],
  },
  {
    type: 'JellyStone',
    position: [66.64128158772287, 91.52668492115949],
  },
  {
    type: 'JellyStone',
    position: [63.519185292442465, 86.40682655084505],
  },
  {
    type: 'JellyStone',
    position: [64.02179083121261, 85.18486639599661],
  },
  {
    type: 'JellyStone',
    position: [65.46071445995561, 86.68524785194977],
  },
  {
    type: 'JellyStone',
    position: [66.10878493758187, 88.33257388348596],
  },
  {
    type: 'JellyStone',
    position: [65.95300746118296, 85.39368237182514],
  },
  {
    type: 'JellyStone',
    position: [65.75615631060226, 127.18007931262392],
  },
  {
    type: 'DeepBrine',
    position: [67.59807535532745, 123.59153809838543],
  },
  {
    type: 'DeepBrine',
    position: [68.3488439429382, 109.75554621848738],
  },
  {
    type: 'DeepBrine',
    position: [64.40868385677894, 102.14536398829195],
  },
  {
    type: 'DeepBrine',
    position: [66.67402885051541, 98.34027287319421],
  },
  {
    type: 'DeepBrine',
    position: [66.15796619084185, 100.343359456142],
  },
  {
    type: 'DeepBrine',
    position: [66.84591016982739, 93.61484467944481],
  },
  {
    type: 'DeepBrine',
    position: [65.89560169417966, 92.08352752336891],
  },
  {
    type: 'DeepBrine',
    position: [63.47796500079597, 88.88941648569539],
  },
  {
    type: 'DeepBrine',
    position: [62.03311199996272, 80.08820980077425],
  },
  {
    type: 'DeepBrine',
    position: [66.88682390602276, 85.05338967047493],
  },
  {
    type: 'DeepBrine',
    position: [66.55121352698552, 86.71618355207252],
  },
  {
    type: 'RadiantOre',
    position: [68.25915302735532, 44.36521008403361],
  },
  {
    type: 'RadiantOre',
    position: [68.31623144038812, 47.32730337078652],
  },
  {
    type: 'RadiantOre',
    position: [67.76957096652166, 47.25769804551034],
  },
  {
    type: 'RadiantOre',
    position: [70.74628385237044, 42.70241620243602],
  },
  {
    type: 'RadiantOre',
    position: [48.64627521453564, 95.31630818619583],
  },
  {
    type: 'RadiantOre',
    position: [46.19628657375215, 82.70227646114624],
  },
  {
    type: 'RadiantOre',
    position: [46.246834409150345, 79.40762439807384],
  },
  {
    type: 'RadiantOre',
    position: [35.97399625507616, 95.41684921159475],
  },
];

const resources = {};

data.forEach((resource, index) => {
  const { position, type } = resource;
  let properties = {};

  switch (type) {
    case 'DeepBrine':
      properties = {
        name: "Deep Brine",
        image: "Resources/iconCraftDeepBrine.png"
      };
      break;
    case 'JellyStone':
      properties = {
        name: "Jelly Stone",
        image: "Resources/iconCraftJellyStone.png"
      };
      break;
    case 'LavaDust':
      properties = {
        name: "Lava Dust",
        image: "Resources/iconCraftLavaDust.png"
      };
      break;
    case 'PrimordyOil':
      properties = {
        name: "Primordy Oil",
        image: "Resources/iconCraftPrimordyOil.png",
      };
      break;
    case 'RadiantOre':
      properties = {
        name: "Radiant Ore",
        image: "Resources/iconCraftRadiantOre.png"
      };
      break;
    case 'SilkySand':
      properties = {
        name: "Silky Sand",
        image: "Resources/iconCraftSilkySand.png"
      };
      break;
    default:
      properties = {};
      break;
  }

  resources[index] = {
    ...properties,
    position,
  };
});

export default resources;
