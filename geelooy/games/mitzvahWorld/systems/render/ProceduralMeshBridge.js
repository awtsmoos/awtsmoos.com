// B"H
/**
 * @file ProceduralMeshBridge.js
 * @description Converts procedural command/vessel packets into renderer-neutral mesh packets.
 *
 * The bridge is a covenant: commands may arrive from old Olam vessels, new
 * Sefiros packets, starting-zone installers, or future universe compilers.
 * They all receive one stable entrance into procedural mesh manifestation.
 */
import { createProceduralMeshPacket } from "../procedural/api/ProceduralMeshApi.js";
import { compileBufferGeometry } from "../procedural/buffer/BufferGeometryCompiler.js";
import { compileMaterialIntent } from "../procedural/materials/MaterialIntentCompiler.js";

function commandId(command = {}, fallback = "procedural_object") {
  return command.id || command.targetId || command.name || fallback;
}

function recipeOf(command = {}) {
  return command.procedural?.recipe || command.recipe || command.kind || command.type || "box";
}

function primitiveOf(command = {}) {
  return command.primitive || command.procedural?.primitive || recipeOf(command);
}

function transformOf(command = {}) {
  const transform = command.manual?.transform || command.transform || {};
  return {
    position:transform.position || command.position || [0,0,0],
    rotation:transform.rotation || command.rotation || [0,0,0],
    scale:transform.scale || command.scale || [1,1,1]
  };
}

export function proceduralRenderMeshPacket(response = {}) {
  const data = response.result || response;
  return {
    kind:"procedural_render_mesh",
    id:data.id || data.geometry?.id,
    geometry:compileBufferGeometry(data),
    material:compileMaterialIntent(data),
    source:data
  };
}

export function proceduralFromCommand(command = {}) {
  const transform = transformOf(command);
  const response = createProceduralMeshPacket({
    ...command,
    id:commandId(command),
    primitive:primitiveOf(command),
    recipe:recipeOf(command),
    position:transform.position,
    rotation:transform.rotation,
    scale:transform.scale,
    modifiers:command.modifiers || [],
    material:command.material || command.procedural?.material || {},
    shader:command.shader || command.procedural?.shader || null,
    group:command.group || "ungrouped"
  });
  const mesh = proceduralRenderMeshPacket(response);
  return { ...mesh, command, response };
}

export function proceduralFromCommands(commands = []) {
  return commands.map(proceduralFromCommand);
}

export default proceduralFromCommand;
