// B"H
export function animalReport(runtime = {}) { return { animals:runtime.animals?.length || 0, decisions:runtime.decisions?.length || 0, herds:runtime.herds?.length || 0, loot:runtime.loot?.length || 0 }; }
