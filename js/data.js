// Ultima Online Map POI Data
// Coordinates are UO in-game coordinates (X, Y)

const UO_MAPS = {
  felucca: {
    name: 'Felucca',
    width: 7170,
    height: 4098,
    description: 'The facet of danger - full PvP',
    regions: {
      all:       { name: 'All',        x1: 0,    y1: 0,    x2: 7170, y2: 4098 },
      britannia: { name: 'Britannia',  x1: 0,    y1: 0,    x2: 5120, y2: 4098 },
      t2a:       { name: 'T2A',        x1: 5040, y1: 1200, x2: 6400, y2: 4098 }
    }
  },
  trammel: {
    name: 'Trammel',
    width: 7170,
    height: 4098,
    description: 'The safe facet - consensual PvP only',
    regions: {
      all:       { name: 'All',        x1: 0,    y1: 0,    x2: 7170, y2: 4098 },
      britannia: { name: 'Britannia',  x1: 0,    y1: 0,    x2: 5120, y2: 4098 },
      t2a:       { name: 'T2A',        x1: 5040, y1: 1200, x2: 6400, y2: 4098 }
    }
  },
  ilshenar: {
    name: 'Ilshenar',
    width: 2304,
    height: 1600,
    description: 'Land of the gargoyles'
  },
  malas: {
    name: 'Malas',
    width: 2560,
    height: 2048,
    description: 'Shattered land of Luna and Umbra'
  },
  tokuno: {
    name: 'Tokuno Islands',
    width: 1448,
    height: 1448,
    description: 'Eastern islands inspired by feudal Japan'
  }
};

const POI_CATEGORIES = {
  city: {
    name: 'Cities',
    icon: 'fa-solid fa-city',
    color: '#4ade80',
    markerColor: '#22c55e'
  },
  dungeon: {
    name: 'Dungeons',
    icon: 'fa-solid fa-skull',
    color: '#f87171',
    markerColor: '#ef4444'
  },
  moongate: {
    name: 'Moongates',
    icon: 'fa-solid fa-circle-dot',
    color: '#c084fc',
    markerColor: '#a855f7'
  },
  shrine: {
    name: 'Shrines',
    icon: 'fa-solid fa-star',
    color: '#fbbf24',
    markerColor: '#f59e0b'
  },
  poi: {
    name: 'Points of Interest',
    icon: 'fa-solid fa-location-dot',
    color: '#fb923c',
    markerColor: '#f97316'
  },
  vendor: {
    name: 'Vendors',
    icon: 'fa-solid fa-shop',
    color: '#22d3ee',
    markerColor: '#06b6d4'
  }
};

const VENDOR_TYPES = [
  { value: 'weapons', label: 'Weapons & Armor' },
  { value: 'clothing', label: 'Clothing & Jewelry' },
  { value: 'potions', label: 'Potions & Reagents' },
  { value: 'scrolls', label: 'Scrolls & Spellbooks' },
  { value: 'resources', label: 'Resources & Materials' },
  { value: 'rares', label: 'Rares & Artifacts' },
  { value: 'deco', label: 'Decorations & Furniture' },
  { value: 'taming', label: 'Taming & Pets' },
  { value: 'misc', label: 'Miscellaneous' }
];

// POI Data organized by map and category
const POI_DATA = {
  felucca: {
    city: [
      { name: 'Britain', x: 1495, y: 1629, desc: 'Capital of Britannia. The largest and most populated city, home to Lord British\'s castle.' },
      { name: 'Trinsic', x: 1900, y: 2781, desc: 'City of Honor. A walled southern city known for its paladins.' },
      { name: 'Vesper', x: 2899, y: 676, desc: 'City of Industry. A prosperous trading and mining town.' },
      { name: 'Minoc', x: 2525, y: 480, desc: 'City of Sacrifice. Home to artisans and the Minoc mines.' },
      { name: 'Yew', x: 542, y: 982, desc: 'City of Justice. A forested town with the Courts of Truth.' },
      { name: 'Skara Brae', x: 596, y: 2200, desc: 'City of Spirituality. An island town of rangers and druids.' },
      { name: 'Moonglow', x: 4471, y: 1100, desc: 'City of Honesty. Island city of mages and the Lycaeum.' },
      { name: 'Jhelom', x: 1374, y: 3696, desc: 'City of Valor. Island of warriors and fighting pits.' },
      { name: 'New Magincia', x: 3728, y: 2164, desc: 'City of Humility. Rebuilt from the ruins of old Magincia.' },
      { name: "Nujel'm", x: 3770, y: 1170, desc: 'Island paradise known for its casino and palace.' },
      { name: "Serpent's Hold", x: 2895, y: 3480, desc: 'Fortress of the Order of the Silver Serpent.' },
      { name: 'Cove', x: 2236, y: 1210, desc: 'Small village near the mountains, close to Vesper.' },
      { name: 'Ocllo', x: 3650, y: 2600, desc: 'Small island village south of Magincia.' },
      { name: 'Papua', x: 5770, y: 3180, desc: 'Lost Lands settlement, gateway to the savage lands.' },
      { name: 'Delucia', x: 5242, y: 3978, desc: 'Lost Lands walled settlement, surrounded by dangers.' },
      { name: "Buccaneer's Den", x: 2705, y: 2100, desc: 'Pirate haven. Home to thieves and smugglers.' },
      { name: 'New Haven', x: 3503, y: 2574, desc: 'Training city for new adventurers.' },
      { name: 'Wind', x: 1361, y: 895, desc: 'Hidden mage city accessible only through magic.' }
    ],
    dungeon: [
      { name: 'Covetous', x: 2498, y: 921, desc: 'Dungeon of Covetousness. Multi-level dungeon with harpies, liches, and daemons.' },
      { name: 'Deceit', x: 4111, y: 434, desc: 'Dungeon of Deceit. Undead-infested dungeon on a northern island.' },
      { name: 'Despise', x: 1301, y: 1090, desc: 'Dungeon of Despise. Home to ettins, ogres, and earth elementals.' },
      { name: 'Destard', x: 1176, y: 2637, desc: 'Dungeon of Destruction. Dragon-infested mountain dungeon.' },
      { name: 'Hythloth', x: 4721, y: 3822, desc: 'Dungeon of Injustice. Volcanic dungeon with daemons and balrons.' },
      { name: 'Shame', x: 511, y: 1565, desc: 'Dungeon of Shame. Earth and air elemental dungeon.' },
      { name: 'Wrong', x: 2043, y: 238, desc: 'Dungeon of Wrong. Prison dungeon with various monsters.' },
      { name: 'Khaldun', x: 5571, y: 1320, desc: 'Ancient tomb in the Lost Lands. Home to powerful undead.' },
      { name: 'Fire Dungeon', x: 2923, y: 3409, desc: 'Volcanic dungeon with fire elementals and dragons.' },
      { name: 'Ice Dungeon', x: 1999, y: 81, desc: 'Frozen dungeon with ice elementals and frost trolls.' },
      { name: 'Orc Cave', x: 1017, y: 1430, desc: 'Caverns infested with orc clans.' },
      { name: 'Solen Hive', x: 2607, y: 763, desc: 'Underground hive of the Solen ant creatures.' },
      { name: 'Painted Caves', x: 5765, y: 2622, desc: 'Lost Lands cave system with ancient paintings.' },
      { name: 'Terathan Keep', x: 5451, y: 3143, desc: 'Spider-like Terathan fortress in the Lost Lands.' },
      { name: 'Blighted Grove', x: 587, y: 1641, desc: 'Corrupted forest with twisted creatures.' },
      { name: 'Prism of Light', x: 3785, y: 1090, desc: 'Crystal dungeon with light-based creatures.' },
      { name: 'Twisted Weald', x: 2170, y: 1240, desc: 'Dark forest haunted by fey creatures.' },
      { name: 'Ankh Dungeon', x: 710, y: 1362, desc: 'Ancient dungeon near the Ankh.' },
      { name: 'Wisp Dungeon', x: 652, y: 1298, desc: 'Dungeon inhabited by mysterious wisps.' }
    ],
    moongate: [
      { name: 'Britain Moongate', x: 1336, y: 1997, desc: 'Public moongate near Britain.' },
      { name: 'Moonglow Moongate', x: 4467, y: 1283, desc: 'Public moongate on Moonglow island.' },
      { name: 'Jhelom Moongate', x: 1499, y: 3771, desc: 'Public moongate near Jhelom.' },
      { name: 'Yew Moongate', x: 771, y: 752, desc: 'Public moongate in the Yew forest.' },
      { name: 'Minoc Moongate', x: 2701, y: 692, desc: 'Public moongate near Minoc.' },
      { name: 'Trinsic Moongate', x: 1828, y: 2948, desc: 'Public moongate south of Trinsic.' },
      { name: 'Skara Brae Moongate', x: 643, y: 2067, desc: 'Public moongate near Skara Brae.' },
      { name: 'Magincia Moongate', x: 3563, y: 2139, desc: 'Public moongate near New Magincia.' },
      { name: 'Haven Moongate', x: 3450, y: 2677, desc: 'Public moongate near New Haven.' }
    ],
    shrine: [
      { name: 'Shrine of Compassion', x: 1856, y: 872, desc: 'Virtue Shrine of Compassion.' },
      { name: 'Shrine of Honesty', x: 4209, y: 564, desc: 'Virtue Shrine of Honesty.' },
      { name: 'Shrine of Honor', x: 1723, y: 3528, desc: 'Virtue Shrine of Honor.' },
      { name: 'Shrine of Humility', x: 4274, y: 3699, desc: 'Virtue Shrine of Humility.' },
      { name: 'Shrine of Justice', x: 1300, y: 634, desc: 'Virtue Shrine of Justice.' },
      { name: 'Shrine of Sacrifice', x: 3352, y: 287, desc: 'Virtue Shrine of Sacrifice.' },
      { name: 'Shrine of Spirituality', x: 1589, y: 2485, desc: 'Virtue Shrine of Spirituality.' },
      { name: 'Shrine of Valor', x: 2490, y: 3932, desc: 'Virtue Shrine of Valor.' },
      { name: 'Shrine of Chaos', x: 1456, y: 854, desc: 'Anti-Virtue Shrine of Chaos.' }
    ],
    poi: [
      { name: "Lord British's Castle", x: 1323, y: 1624, desc: 'The grand castle of Lord British in Britain.' },
      { name: "Blackthorn's Castle", x: 1526, y: 1414, desc: 'Castle of Lord Blackthorn.' },
      { name: 'Empath Abbey', x: 639, y: 858, desc: 'Monastery near Yew, home to monks.' },
      { name: 'Lycaeum', x: 4456, y: 1150, desc: 'Great library and academy of magic on Moonglow.' },
      { name: 'Serpentine Passage', x: 2580, y: 3550, desc: 'Mountain passage near Serpent\'s Hold.' },
      { name: 'Hedge Maze', x: 810, y: 1610, desc: 'Mysterious hedge maze in the forests.' },
      { name: 'Lighthouse', x: 4550, y: 1380, desc: 'Moonglow lighthouse on the coast.' },
      { name: 'Graveyard (Britain)', x: 1380, y: 1490, desc: 'Britain city graveyard.' },
      { name: 'Cotton Field', x: 3600, y: 2600, desc: 'Cotton fields near Ocllo.' },
      { name: 'Mines (Minoc)', x: 2560, y: 540, desc: 'Minoc mining area.' },
      { name: 'Spirituality Crossroads', x: 1600, y: 2500, desc: 'Crossroads near the Shrine of Spirituality.' }
    ]
  }
};

// Trammel shares the same geography as Felucca
POI_DATA.trammel = JSON.parse(JSON.stringify(POI_DATA.felucca));

// Ilshenar POIs
POI_DATA.ilshenar = {
  city: [
    { name: 'Lakeshire', x: 1169, y: 998, desc: 'Peaceful lakeside settlement.' },
    { name: 'Mistas', x: 819, y: 1067, desc: 'Small village in the forests.' },
    { name: 'Montor', x: 1582, y: 1067, desc: 'Ancient city of virtue.' }
  ],
  dungeon: [
    { name: 'Exodus Dungeon', x: 852, y: 776, desc: 'Stronghold of the mechanical overlord Exodus.' },
    { name: 'Ankh Dungeon (Ilshenar)', x: 475, y: 755, desc: 'Dungeon beneath the great Ankh.' },
    { name: 'Sorcerer\'s Dungeon', x: 548, y: 455, desc: 'Dark sorcerer hideout.' },
    { name: 'Ancient Citadel', x: 1545, y: 758, desc: 'Ruins of an ancient citadel.' },
    { name: 'Spectre Dungeon', x: 1363, y: 1034, desc: 'Haunted dungeon filled with specters.' }
  ],
  moongate: [],
  shrine: [
    { name: 'Shrine of Valor (Ilshenar)', x: 496, y: 380, desc: 'Ilshenar Virtue Shrine.' },
    { name: 'Shrine of Justice (Ilshenar)', x: 860, y: 600, desc: 'Ilshenar Virtue Shrine.' }
  ],
  poi: [
    { name: 'Gargoyle City', x: 820, y: 930, desc: 'City of the Gargoyle race.' },
    { name: 'Ratman Fort', x: 1340, y: 460, desc: 'Fortified ratman encampment.' }
  ]
};

// Malas POIs
POI_DATA.malas = {
  city: [
    { name: 'Luna', x: 989, y: 519, desc: 'City of Light. Major trading hub with player vendors.' },
    { name: 'Umbra', x: 2038, y: 1348, desc: 'City of Darkness. Home to necromancers.' }
  ],
  dungeon: [
    { name: 'Doom', x: 2368, y: 1584, desc: 'The most challenging dungeon in Malas. Home to the Dark Father.' },
    { name: 'Labyrinth', x: 1732, y: 975, desc: 'Minotaur labyrinth with ancient treasures.' },
    { name: 'Bedlam', x: 2067, y: 1371, desc: 'Necromancer research facility.' }
  ],
  moongate: [
    { name: 'Luna Moongate', x: 1015, y: 527, desc: 'Public moongate near Luna.' },
    { name: 'Umbra Moongate', x: 1997, y: 1386, desc: 'Public moongate near Umbra.' }
  ],
  shrine: [],
  poi: [
    { name: 'Grimswind Ruins', x: 1060, y: 1160, desc: 'Ancient ruins in the Malas wasteland.' },
    { name: 'Hanse\'s Hostel', x: 1645, y: 1140, desc: 'A rest stop in the Malas wilderness.' },
    { name: 'Northpoint', x: 1240, y: 340, desc: 'Northern settlement.' }
  ]
};

// Tokuno POIs
POI_DATA.tokuno = {
  city: [
    { name: 'Zento', x: 735, y: 1255, desc: 'Capital city of the Tokuno Islands.' }
  ],
  dungeon: [
    { name: 'Fan Dancer\'s Dojo', x: 970, y: 222, desc: 'Martial arts dojo overrun by monsters.' },
    { name: 'Yomotsu Mines', x: 258, y: 786, desc: 'Mines inhabited by the Yomotsu creatures.' },
    { name: 'Citadel (Tokuno)', x: 1345, y: 768, desc: 'Fortress of the shadow warriors.' }
  ],
  moongate: [
    { name: 'Makoto-Jima Moongate', x: 802, y: 1204, desc: 'Public moongate on the main Tokuno island.' }
  ],
  shrine: [],
  poi: [
    { name: 'Bushido Dojo', x: 320, y: 1020, desc: 'Training grounds for samurai warriors.' },
    { name: 'Hotspring', x: 363, y: 422, desc: 'Natural hot spring in northern Tokuno.' }
  ]
};
