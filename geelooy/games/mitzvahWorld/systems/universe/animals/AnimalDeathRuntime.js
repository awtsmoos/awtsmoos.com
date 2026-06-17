// B"H
export function animalDeathPacket(animal = {}, combat = {}) { return { animalId:animal.id, dead:combat.dead === true || combat.hp <= 0, reason:combat.hp <= 0 ? "combat" : null }; }
