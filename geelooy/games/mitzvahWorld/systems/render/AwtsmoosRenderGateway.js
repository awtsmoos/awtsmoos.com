// B"H
/** Renderer-agnostic command composer for new systems. */
import { sceneAddCommand, sceneBatch, sceneTagCommand } from "./SceneAdapter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { buildingMeshSpec, npcMeshSpec } from "./MeshAdapter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { MATERIALS } from "./MaterialAdapter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { movieSunLight } from "./LightAdapter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { cameraCommandBatch } from "./CameraAdapter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { animationBatch } from "./AnimationAdapter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { proceduralFromCommand } from "./ProceduralMeshBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
function objectFor(command) { if (command.type === "building") return buildingMeshSpec(command); if (command.type === "npc_spawn") return npcMeshSpec(command); return proceduralFromCommand(command); }
export function composeRenderCommands(plan = {}) {
  const commands = plan.commands || [];
  const sceneObjects = commands.map(c => sceneAddCommand(objectFor(c)));
  const camera = cameraCommandBatch(plan.movie?.camera || []);
  const animations = animationBatch(plan.animations?.locomotion?.queued || []);
  return sceneBatch([ sceneTagCommand("movieUniverseReady", true), sceneAddCommand(movieSunLight()), sceneTagCommand("materials", MATERIALS), ...sceneObjects, ...camera, ...animations ]);
}
export default composeRenderCommands;
