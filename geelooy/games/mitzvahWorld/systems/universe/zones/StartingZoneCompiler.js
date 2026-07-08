// B"H
import { zoneManifest } from "./ZoneManifest.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { compileZoneObjects } from "./ZoneObjectCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { collidersForObjects } from "../colliders/ColliderGenerator.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { colliderReport } from "../colliders/ColliderReport.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { animalLootBridge } from "../animals/AnimalLootBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { startingZoneReport } from "./StartingZoneReport.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
function lootTables(zone = {}) { return [...(zone.animals || []).map(animalLootBridge), ...(zone.terrain?.trees || []).map(t => ({ targetId:t.id, type:"tree", loot:t.loot || { wood:.8 } }))]; }
export function compileStartingZone(zone = {}) { const manifest = zoneManifest(zone), compiled = compileZoneObjects(zone), colliders = collidersForObjects(compiled.objects), out = { manifest, objects:compiled.objects, dialogues:compiled.dialogues, colliders, colliderReport:colliderReport(colliders), lootTables:lootTables(zone) }; out.report = startingZoneReport(out); return out; }
export default compileStartingZone;
