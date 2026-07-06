// B"H
/** @file AnimalHerdRuntime.js @description Herds are families with leaders, spacing, panic, and migration goals. */
export function herdRole(index, count) { if (index === 0) return "leader"; if (index === count - 1) return "rear-guard"; return "member"; }
export function buildHerd(animals = []) { const by = new Map(); for (const animal of animals) { const id = animal.herdId || `${animal.profile?.species || animal.kind}_herd`; if (!by.has(id)) by.set(id, []); by.get(id).push(animal); } return [...by].map(([id, members]) => ({ id, species:members[0]?.profile?.species || "mixed", size:members.length, members:members.map((m,i) => ({ id:m.id, role:herdRole(i, members.length) })), cohesion:+Math.min(1, .35 + members.length * .08).toFixed(2), migrationGoal:null })); }
export default buildHerd;
