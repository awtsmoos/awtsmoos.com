// B"H
import { ColliderRuntime } from "../colliders/ColliderRuntime.js";
import { LootRegistry } from "../loot/LootRegistry.js";
import { animalControllerPackets } from "../animals/AnimalControllerPacket.js";
import { DialogueHookRegistry } from "../dialogue/DialogueHookRegistry.js";
import { atmosphereInstallPackets } from "../atmosphere/AtmosphereInstallPacket.js";
import { StartingZoneInstallRegistry } from "./StartingZoneInstallRegistry.js";
import { startingZoneInstallReport } from "./StartingZoneInstallReport.js";
import { startingZoneSefirosBridge } from "./StartingZoneSefirosBridge.js";
function visualPackets(zone) { return (zone.objects || []).map(o => ({ kind:"visual_install", id:o.id, type:o.type, command:o.command, source:o })); }
export function executeStartingZone(zone = {}) { const registry = new StartingZoneInstallRegistry(); const visuals = visualPackets(zone), colliderRuntime = new ColliderRuntime(zone.colliders || []).snapshot(), lootRegistry = new LootRegistry(zone.lootTables || []).snapshot(), animalControllers = animalControllerPackets(zone.objects || []), dialogueHooks = new DialogueHookRegistry(zone.dialogues || [], (zone.objects || []).filter(o => o.type === "zone_npc")).snapshot(), atmospherePackets = atmosphereInstallPackets(zone.objects || []), sefiros = startingZoneSefirosBridge(zone); registry.addAll("visual", visuals); registry.addAll("collider", colliderRuntime.packets); registry.addAll("animal", animalControllers); registry.addAll("atmosphere", atmospherePackets); const out = { zone, visualPackets:visuals, colliderRuntime, lootRegistry, animalControllers, dialogueHooks, atmospherePackets, sefiros, registry:registry.snapshot() }; out.report = startingZoneInstallReport(out); return out; }
export default executeStartingZone;
