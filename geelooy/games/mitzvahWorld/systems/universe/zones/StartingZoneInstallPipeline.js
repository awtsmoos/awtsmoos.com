// B"H
import { executeStartingZoneMeshes } from "./StartingZoneMeshExecutor.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { bindCollidersToMeshes } from "./StartingZoneColliderMeshBinder.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { bindLootToMeshes } from "./StartingZoneLootBinder.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { bindDialogueToNpcs } from "./StartingZoneDialogueBinder.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { bindAnimalControllers } from "./StartingZoneAnimalBinder.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { bindAtmosphere } from "./StartingZoneAtmosphereBinder.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { startingZoneMeshReport } from "./StartingZoneMeshReport.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { animalControllerPackets } from "../animals/AnimalControllerPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function runStartingZoneInstallPipeline(zone = {}) { const meshExec = executeStartingZoneMeshes(zone); const animalControllers = animalControllerPackets(zone.objects || []); return { meshExec, colliderBindings:bindCollidersToMeshes(meshExec.meshes, zone.colliders || []), lootBindings:bindLootToMeshes(meshExec.meshes, zone.lootTables || []), dialogueBindings:bindDialogueToNpcs(zone.objects || [], zone.dialogues || []), animalBindings:bindAnimalControllers(zone.objects || [], animalControllers), atmosphereBindings:bindAtmosphere(zone.objects || []), report:startingZoneMeshReport(meshExec.meshes) }; }
