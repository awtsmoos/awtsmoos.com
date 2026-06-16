// B"H
/** @file HiddenCaveRuntime.js @description Entry checks and warnings for Hidden Cave. */
import MiniDungeonRegistry from "./MiniDungeonRegistry.js";
export function canEnterHiddenCave(player) { const d = MiniDungeonRegistry.hidden_cave; return Number(player?.level || 1) >= d.levelRange[0]; }
export function enterHiddenCave(olam) { const p = olam?.player || olam?.chossid; const ok = canEnterHiddenCave(p); olam?.ayshPeula?.("ui event", "effectsOverlay", { text: ok ? "Entering Hidden Cave" : "DANGEROUS CAVE", color: ok ? "#d7c8ff" : "#ff4b43" }); return ok; }
export default { canEnterHiddenCave, enterHiddenCave };
