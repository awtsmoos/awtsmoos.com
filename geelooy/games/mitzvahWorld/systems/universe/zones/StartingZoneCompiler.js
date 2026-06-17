// B"H
import { zoneManifest } from "./ZoneManifest.js";
import { compileZoneObjects } from "./ZoneObjectCompiler.js";
import { collidersForObjects } from "../colliders/ColliderGenerator.js";
import { colliderReport } from "../colliders/ColliderReport.js";
import { animalLootBridge } from "../animals/AnimalLootBridge.js";
import { startingZoneReport } from "./StartingZoneReport.js";
function lootTables(zone = {}) { return [...(zone.animals || []).map(animalLootBridge), ...(zone.terrain?.trees || []).map(t => ({ targetId:t.id, type:"tree", loot:t.loot || { wood:.8 } }))]; }
export function compileStartingZone(zone = {}) { const manifest = zoneManifest(zone), compiled = compileZoneObjects(zone), colliders = collidersForObjects(compiled.objects), out = { manifest, objects:compiled.objects, dialogues:compiled.dialogues, colliders, colliderReport:colliderReport(colliders), lootTables:lootTables(zone) }; out.report = startingZoneReport(out); return out; }
export default compileStartingZone;
