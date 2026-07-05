// B"H
/** Tap targeting: select, switch, or clear instead of trapping stale targets. */
import PointerUpdater from "../../methods/interaction/PointerUpdater.js";
export function updatePointerFromPacket(olam, peula = {}) { const x = peula.clientX ?? peula.x ?? peula.touches?.[0]?.clientX, y = peula.clientY ?? peula.y ?? peula.touches?.[0]?.clientY; if (x !== undefined && y !== undefined) PointerUpdater.update(olam, x, y); return { x:olam.pointer?.x, y:olam.pointer?.y }; }
export function clearTarget(olam, reason) { olam.combatManager?.targeting?.set?.(null); olam.__selectedCombatTarget = null; olam.__lastCombatTargetClear = { at:Date.now(), reason }; return true; }
export function selectFromTap(olam, peula = {}, source = "tap") {
  const pointer = updatePointerFromPacket(olam, peula), result = olam.combatManager?.selectTargetFromPointer?.({ source, isTouch:peula.isTouch });
  olam.__lastCombatTapSelection = { at:Date.now(), source, result, pointer, isTouch:Boolean(peula.isTouch) };
  if (result === "selected" || result === "confirmed") { olam.ayshPeula("ui event", "effectsOverlay", { text:result === "selected" ? "TARGET SELECTED" : "TARGET READY", color:"#ffd95a" }); return true; }
  if (peula.tap || source === "touchend") clearTarget(olam, "empty-mobile-tap");
  return false;
}
