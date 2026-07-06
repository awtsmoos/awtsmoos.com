// B"H
export const LOOT_TABLES = {
  fox:[{ id:"hide", qty:1 }, { id:"fox_tail", qty:1 }],
  goat:[{ id:"feather", qty:1 }, { id:"apple", qty:1 }],
  boar:[{ id:"hide", qty:1 }, { id:"boar_tusk", qty:1 }],
  guardian_ram:[{ id:"hide", qty:1 }, { id:"apple", qty:1 }, { id:"boar_tusk", qty:1 }]
};

export function lootForSpecies(species) {
  const base = LOOT_TABLES[species] || [{ id:"apple", qty:1 }];
  return base.map(row => ({ ...row }));
}
