// B"H
import { proceduralBuilding } from "../procedural/ProceduralBuildingBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { proceduralHuman } from "../procedural/ProceduralHumanBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { proceduralNature } from "../procedural/ProceduralNatureBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { proceduralPath } from "../procedural/ProceduralPathBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { proceduralRenderMeshPacket } from "../../render/ProceduralMeshBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { StartingZoneMeshRegistry } from "./StartingZoneMeshRegistry.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
function proceduralFor(object) { if (["branch_house","building"].includes(object.type)) return proceduralBuilding(object); if (["zone_npc"].includes(object.type)) return proceduralHuman(object); if (["fence","road","path"].includes(object.type)) return proceduralPath(object); return proceduralNature(object); }
export function executeStartingZoneMeshes(zone = {}) { const meshes = (zone.objects || []).filter(o => !["sun_atmosphere","lens_flare","fog"].includes(o.type)).map(o => ({ ...proceduralRenderMeshPacket(proceduralFor(o)), source:o })); const registry = new StartingZoneMeshRegistry(); registry.addAll(meshes); return { meshes, registry:registry.snapshot() }; }
