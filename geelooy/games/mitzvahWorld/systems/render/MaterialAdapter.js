// B"H
/** Material intent, not renderer material. */
export function materialIntent(name, props = {}) { return { adapter:"material", name, props }; }
export const MATERIALS = Object.freeze({ villageWarm:materialIntent("village_warm", { palette:"sunlit_earth" }), npcSoft:materialIntent("npc_soft", { palette:"human_story" }), torahGlow:materialIntent("torah_glow", { palette:"blue_gold" }) });
