// B"H
/** @file MountRuntime.js @description Solo mount unlocks and mounted movement state. */
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
export const MountRegistry = Object.freeze([{ id:"donkey", name:"Village Donkey", speed:1.35 }, { id:"camel", name:"Desert Camel", speed:1.6 }, { id:"horse", name:"Swift Horse", speed:1.8 }]);
export function ensureMountState(olam) { const p = playerOf(olam); if (!p) return null; p.mountState ||= { owned:{ donkey:true }, active:null }; return p.mountState; }
export function summonMount(olam, id = "donkey") { const s = ensureMountState(olam); if (!s?.owned?.[id]) return { ok:false, reason:"not-owned" }; s.active = id; olam?.ayshPeula?.("ui event", "mount", { active:id, registry:MountRegistry }); return { ok:true, active:id }; }
export function dismissMount(olam) { const s = ensureMountState(olam); if (s) s.active = null; olam?.ayshPeula?.("ui event", "mount", { active:null }); return s; }
export default { MountRegistry, ensureMountState, summonMount, dismissMount };
