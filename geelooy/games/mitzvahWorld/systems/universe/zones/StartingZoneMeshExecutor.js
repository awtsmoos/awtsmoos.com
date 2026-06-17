// B"H
import { proceduralBuilding } from "../procedural/ProceduralBuildingBridge.js";
import { proceduralHuman } from "../procedural/ProceduralHumanBridge.js";
import { proceduralNature } from "../procedural/ProceduralNatureBridge.js";
import { proceduralPath } from "../procedural/ProceduralPathBridge.js";
import { proceduralRenderMeshPacket } from "../../render/ProceduralMeshBridge.js";
import { StartingZoneMeshRegistry } from "./StartingZoneMeshRegistry.js";
function proceduralFor(object) { if (["branch_house","building"].includes(object.type)) return proceduralBuilding(object); if (["zone_npc"].includes(object.type)) return proceduralHuman(object); if (["fence","road","path"].includes(object.type)) return proceduralPath(object); return proceduralNature(object); }
export function executeStartingZoneMeshes(zone = {}) { const meshes = (zone.objects || []).filter(o => !["sun_atmosphere","lens_flare","fog"].includes(o.type)).map(o => ({ ...proceduralRenderMeshPacket(proceduralFor(o)), source:o })); const registry = new StartingZoneMeshRegistry(); registry.addAll(meshes); return { meshes, registry:registry.snapshot() }; }
