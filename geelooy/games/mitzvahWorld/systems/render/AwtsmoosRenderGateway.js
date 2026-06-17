// B"H
/** Renderer-agnostic command composer for new systems. */
import { sceneAddCommand, sceneBatch, sceneTagCommand } from "./SceneAdapter.js";
import { buildingMeshSpec, npcMeshSpec } from "./MeshAdapter.js";
import { MATERIALS } from "./MaterialAdapter.js";
import { movieSunLight } from "./LightAdapter.js";
import { cameraCommandBatch } from "./CameraAdapter.js";
import { animationBatch } from "./AnimationAdapter.js";
import { proceduralFromCommand } from "./ProceduralMeshBridge.js";
function objectFor(command) { if (command.type === "building") return buildingMeshSpec(command); if (command.type === "npc_spawn") return npcMeshSpec(command); return proceduralFromCommand(command); }
export function composeRenderCommands(plan = {}) {
  const commands = plan.commands || [];
  const sceneObjects = commands.map(c => sceneAddCommand(objectFor(c)));
  const camera = cameraCommandBatch(plan.movie?.camera || []);
  const animations = animationBatch(plan.animations?.locomotion?.queued || []);
  return sceneBatch([ sceneTagCommand("movieUniverseReady", true), sceneAddCommand(movieSunLight()), sceneTagCommand("materials", MATERIALS), ...sceneObjects, ...camera, ...animations ]);
}
export default composeRenderCommands;
