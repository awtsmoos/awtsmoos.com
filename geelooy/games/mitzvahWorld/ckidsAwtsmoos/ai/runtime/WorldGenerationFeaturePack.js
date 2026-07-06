// B"H
/** @file WorldGenerationFeaturePack.js @description Installs compiled AI worlds into the shared facade. */
import { compileCompactWorldIntent } from "./CompactWorldCompiler.js";
export function installWorldGenerationFeaturePack(runtime, intent = {}) { const world = compileCompactWorldIntent(intent); for (const entity of world.entities) runtime?.registerEntity?.(entity); runtime?.markReady?.("ai:world-generation", { entities:world.entities.length, world:world.id }); return world; }
export default installWorldGenerationFeaturePack;
