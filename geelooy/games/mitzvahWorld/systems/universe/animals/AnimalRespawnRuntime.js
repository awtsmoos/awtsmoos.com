// B"H
export function animalRespawnPacket(animal = {}) { return { animalId:animal.id, respawn:Boolean(animal.respawn ?? true), seconds:animal.respawnSeconds || 180 }; }
