// B"H
import { animalDecision } from "./AnimalBrain.js";
import { animalSchedule } from "./AnimalSchedule.js";
import { animalCombatState } from "./AnimalCombatRuntime.js";
import { animalLootRuntime } from "./AnimalLootRuntime.js";
import { animalRespawnPacket } from "./AnimalRespawnRuntime.js";
import { animalHerds } from "./AnimalHerdRuntime.js";
import { animalReport } from "./AnimalReport.js";
export class AnimalRuntime { constructor(animals = []) { this.animals = animals; this.decisions = animals.map(animalDecision); this.schedules = animals.map(a => ({ animalId:a.id, schedule:animalSchedule(a) })); this.combat = animals.map(animalCombatState); this.loot = animals.map(animalLootRuntime); this.respawn = animals.map(animalRespawnPacket); this.herds = animalHerds(animals); } snapshot() { const state = { animals:this.animals, decisions:this.decisions, schedules:this.schedules, combat:this.combat, loot:this.loot.map(l=>({ animalId:l.animalId, preview:l.preview })), respawn:this.respawn, herds:this.herds }; return { ...state, report:animalReport(this) }; } }
export default AnimalRuntime;
