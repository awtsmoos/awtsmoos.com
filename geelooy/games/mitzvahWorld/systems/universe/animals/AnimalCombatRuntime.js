// B"H
export function animalCombatState(animal = {}) { return { animalId:animal.id, hp:animal.combat?.hp || 8, hostile:Boolean(animal.combat?.hostile), canFlee:animal.combat?.canFlee !== false }; }
export function damageAnimal(state = {}, amount = 1) { const hp = Math.max(0, (state.hp || 0) - amount); return { ...state, hp, dead:hp <= 0 }; }
