// B"H
import { animalDecision } from "./AnimalBrain.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { animalSchedule } from "./AnimalSchedule.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { animalCombatState } from "./AnimalCombatRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { animalLootRuntime } from "./AnimalLootRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { animalRespawnPacket } from "./AnimalRespawnRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { animalHerds } from "./AnimalHerdRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { animalReport } from "./AnimalReport.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export class AnimalRuntime { constructor(animals = []) { this.animals = animals; this.decisions = animals.map(animalDecision); this.schedules = animals.map(a => ({ animalId:a.id, schedule:animalSchedule(a) })); this.combat = animals.map(animalCombatState); this.loot = animals.map(animalLootRuntime); this.respawn = animals.map(animalRespawnPacket); this.herds = animalHerds(animals); } snapshot() { const state = { animals:this.animals, decisions:this.decisions, schedules:this.schedules, combat:this.combat, loot:this.loot.map(l=>({ animalId:l.animalId, preview:l.preview })), respawn:this.respawn, herds:this.herds }; return { ...state, report:animalReport(this) }; } }
export default AnimalRuntime;
