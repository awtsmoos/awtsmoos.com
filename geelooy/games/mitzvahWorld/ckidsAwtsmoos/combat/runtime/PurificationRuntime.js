// B"H
/** @file PurificationRuntime.js @description Battles elevate sparks and heal regions instead of only subtracting HP. */
export function purifyRegion(runtime, regionId, source = {}) { const entity = runtime?.entities?.get?.(regionId) || { id:regionId, kind:"region" }; const purified = { ...entity, purified:true, corruption:0, music:"healed", trees:"regrowing", npcDialogue:"hopeful", source }; runtime?.registerEntity?.(purified); runtime?.markReady?.(`purification:${regionId}`, { regionId }); return purified; }
export function purificationReward(type = "spark") { return { type, xp:10, blessing:"regional-health", unlocks:["music-change","tree-regrowth","npc-dialogue-shift"] }; }
export default { purifyRegion, purificationReward };
