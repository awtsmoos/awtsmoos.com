// B"H
/** @file CompactWorldIntentSchema.js @description The AI speaks compactly; the runtime receives structured vessels. */
export const WORLD_INTENT_KEYS = Object.freeze(["village","river","mountain","synagogue","forest","farm","road","npcs","animals","economy","weather","dialogue","schedules","quests","regions","cinematics"]);
export function normalizeWorldIntent(intent = {}) { const out = {}; for (const key of WORLD_INTENT_KEYS) out[key] = intent[key] ?? null; out.name = intent.name || "Generated Mitzvah World"; out.seed = intent.seed || `${Date.now()}`; return out; }
export default normalizeWorldIntent;
