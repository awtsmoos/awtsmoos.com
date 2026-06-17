// B"H
import { executeStartingZoneMeshes } from "./StartingZoneMeshExecutor.js";
import { bindCollidersToMeshes } from "./StartingZoneColliderMeshBinder.js";
import { bindLootToMeshes } from "./StartingZoneLootBinder.js";
import { bindDialogueToNpcs } from "./StartingZoneDialogueBinder.js";
import { bindAnimalControllers } from "./StartingZoneAnimalBinder.js";
import { bindAtmosphere } from "./StartingZoneAtmosphereBinder.js";
import { startingZoneMeshReport } from "./StartingZoneMeshReport.js";
import { animalControllerPackets } from "../animals/AnimalControllerPacket.js";
export function runStartingZoneInstallPipeline(zone = {}) { const meshExec = executeStartingZoneMeshes(zone); const animalControllers = animalControllerPackets(zone.objects || []); return { meshExec, colliderBindings:bindCollidersToMeshes(meshExec.meshes, zone.colliders || []), lootBindings:bindLootToMeshes(meshExec.meshes, zone.lootTables || []), dialogueBindings:bindDialogueToNpcs(zone.objects || [], zone.dialogues || []), animalBindings:bindAnimalControllers(zone.objects || [], animalControllers), atmosphereBindings:bindAtmosphere(zone.objects || []), report:startingZoneMeshReport(meshExec.meshes) }; }
