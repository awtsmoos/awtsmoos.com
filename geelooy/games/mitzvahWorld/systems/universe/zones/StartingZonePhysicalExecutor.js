// B"H
import { ColliderRuntime } from "../colliders/ColliderRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { LootRegistry } from "../loot/LootRegistry.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { animalControllerPackets } from "../animals/AnimalControllerPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { DialogueHookRegistry } from "../dialogue/DialogueHookRegistry.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { atmosphereInstallPackets } from "../atmosphere/AtmosphereInstallPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { StartingZoneInstallRegistry } from "./StartingZoneInstallRegistry.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { startingZoneInstallReport } from "./StartingZoneInstallReport.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { startingZoneSefirosBridge } from "./StartingZoneSefirosBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
function visualPackets(zone) { return (zone.objects || []).map(o => ({ kind:"visual_install", id:o.id, type:o.type, command:o.command, source:o })); }
export function executeStartingZone(zone = {}) { const registry = new StartingZoneInstallRegistry(); const visuals = visualPackets(zone), colliderRuntime = new ColliderRuntime(zone.colliders || []).snapshot(), lootRegistry = new LootRegistry(zone.lootTables || []).snapshot(), animalControllers = animalControllerPackets(zone.objects || []), dialogueHooks = new DialogueHookRegistry(zone.dialogues || [], (zone.objects || []).filter(o => o.type === "zone_npc")).snapshot(), atmospherePackets = atmosphereInstallPackets(zone.objects || []), sefiros = startingZoneSefirosBridge(zone); registry.addAll("visual", visuals); registry.addAll("collider", colliderRuntime.packets); registry.addAll("animal", animalControllers); registry.addAll("atmosphere", atmospherePackets); const out = { zone, visualPackets:visuals, colliderRuntime, lootRegistry, animalControllers, dialogueHooks, atmospherePackets, sefiros, registry:registry.snapshot() }; out.report = startingZoneInstallReport(out); return out; }
export default executeStartingZone;
