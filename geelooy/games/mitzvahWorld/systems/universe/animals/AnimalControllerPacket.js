// B"H
export function animalControllerPacket(animal = {}) { return { kind:"animal_controller", id:animal.id, species:animal.species, behavior:animal.behavior || "wander", combat:animal.combat || { hp:8 }, loot:animal.loot || null, transform:animal.manual?.transform || null }; }
export function animalControllerPackets(objects = []) { return objects.filter(o => o.type === "animal").map(animalControllerPacket); }
