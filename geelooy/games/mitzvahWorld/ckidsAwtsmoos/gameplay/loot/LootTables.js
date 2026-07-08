// B"H
import { harvestAnimal } from "../../platform/MitzvahPlatformCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export const LOOT_TABLES = {
  fox:[{ id:"hide", qty:1 }, { id:"fox_tail", qty:1 }],
  goat:[{ id:"hide", qty:1 }, { id:"small_horn", qty:1 }],
  cow:[{ id:"hide", qty:1 }],
  deer:[{ id:"hide", qty:1 }, { id:"antler", qty:1 }],
  chicken:[{ id:"feather", qty:2 }],
  boar:[{ id:"hide", qty:1 }, { id:"boar_tusk", qty:1 }],
  sheep:[{ id:"wool_bundle", qty:2 }, { id:"hide", qty:1 }],
  guardian_ram:[{ id:"wool_bundle", qty:2 }, { id:"small_horn", qty:2 }]
};

export function lootForSpecies(species, options = {}) {
  const harvest = harvestAnimal(species, options);
  const fromRules = harvest.outputs.map(id => ({ id, qty:id.includes("meat") || id.includes("poultry") ? 2 : 1 }));
  const base = fromRules.length ? fromRules : (LOOT_TABLES[species] || [{ id:"apple", qty:1 }]);
  return base.map(row => ({ ...row, kosherSpecies:harvest.kosherSpecies, usableForFood:harvest.usableForFood }));
}
