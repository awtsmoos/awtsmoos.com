// B"H
/** @file AnimalEcosystemRuntime.js @description Genetics, needs, migration, social memory, and herds. */
export function createAnimalEcosystemRuntime(memory = globalThis.__MITZVAH_WORLD_MEMORY__) {
  const animals = new Map();
  function create(id, species = 'goat', seed = animals.size + 1) { const a = { id, species, age:seed % 12, sex:seed % 2 ? 'male':'female', weight:40 + seed % 35, health:80, hunger:20, thirst:20, herd:`${species}-herd`, temperament:seed % 3 }; animals.set(id, a); memory?.animal?.remember?.(id, 'born', { species }); return a; }
  function need(id, kind, amount = 1) { const a = animals.get(id) || create(id); a[kind] = (a[kind] || 0) + amount; memory?.animal?.remember?.(id, 'need', { kind, amount }); return a; }
  function migrate(id, to) { const a = animals.get(id) || create(id); a.region = to; memory?.animal?.remember?.(id, 'trail', { to }); return a; }
  function report() { return { animals:animals.size, herds:[...new Set([...animals.values()].map(a => a.herd))] }; }
  return { create, need, migrate, report, animals };
}
export default createAnimalEcosystemRuntime;
