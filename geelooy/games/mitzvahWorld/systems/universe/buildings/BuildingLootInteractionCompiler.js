// B"H
export function buildingLootInteraction(command = {}) { return { id:`${command.id}_loot_interaction`, targetId:command.id, loot:command.loot || {}, interaction:"search" }; }
