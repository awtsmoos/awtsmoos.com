// B"H
export function animalMovementIntent(animal = {}, action = "wander") { return { animalId:animal.id, species:animal.species, action, speed:action === "flee" ? 2.8 : 1.1, radius:animal.wanderRadius || 12 }; }
