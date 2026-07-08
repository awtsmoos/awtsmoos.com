// B"H
/** @file TorahActionRuntime.js @description Action bar casts passages/macros with trainer ranks, weapon fitting, facing, range, moving-target projectiles, and refunds. */
import { ensureActionBarState, emitActionBar, resolveActionSlot, assignActionSlot } from "./TorahActionBarState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ensureSpellbook, learnPassage, openSpellbook, notePassageUse } from "./TorahSpellbookRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { recordPassageUse, emitCodex } from "./TorahCodexRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { grantPassageUseSkills } from "./TorahSkillRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { rankedPassage } from "../trainers/TrainerRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { progressActiveObjectives } from "../missions/MissionObjectiveRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function toast(olam, text, color = "#ffe680") { olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color }); }
function koach(player) { return Number(player?.koach ?? player?.maxKoach ?? 100); }
function weaponFor(passage = {}) { if (passage.weaponHint) return passage.weaponHint; if (passage.category === "Kabbalah" || passage.seferId === "zohar") return "keshes_haemes"; if (passage.heal || passage.category === "Niggun") return "mateh_hatorah"; return "cherev_hakodesh"; }
function noteCastObjective(olam, passage) { progressActiveObjectives(olam, "cast", 1); if (passage?.id) progressActiveObjectives(olam, `cast:${passage.id}`, 1); if (passage?.name) progressActiveObjectives(olam, `cast:${passage.name}`, 1); }
function refund(player, before) { player.koach = Math.min(Number(player.maxKoach || 100), before); }
export function ensureTorahActionBar(olam) { ensureSpellbook(olam); return ensureActionBarState(olam); }
export function emitTorahActionBar(olam) { return emitActionBar(olam); }
export function unlockTorahSkill(olam, skillId) { const move = learnPassage(olam, skillId); ensureActionBarState(olam); return move; }
export function castTorahSlot(olam, slotNumber) {
  const p = playerOf(olam), action = resolveActionSlot(olam, slotNumber); if (!p || !action) return false;
  if (action.type === "macro") { olam?.ayshPeula?.("runMacro", { macroId:action.macroId }); toast(olam, `MACRO: ${action.name || action.macroId}`, "#d7c8ff"); return true; }
  if (action.type !== "passage" || !action.passage) return toast(olam, "EMPTY SLOT", "#ff9966"), false;
  const passage = rankedPassage(olam, action.passage), cost = Number(passage.cost || 0), before = koach(p);
  if (before < cost) return toast(olam, "LOW KOACH", "#70b7ff"), false;
  p.koach = Math.max(0, before - cost); olam.combatManager?.equipWeapon?.(weaponFor(passage), { silent:true });
  const result = olam.combatManager?.attack?.({ source:"torahActionBar", quiet:true, torahPassage:passage, skipWeaponCost:true });
  const ok = result === true || result?.ok === true; if (!ok) { refund(p, before); emitActionBar(olam); return false; }
  notePassageUse(olam, passage.id); recordPassageUse(olam, passage); grantPassageUseSkills(olam, passage); noteCastObjective(olam, passage); toast(olam, `${passage.name.toUpperCase()} R${passage.rank}`, "#d7c8ff"); emitActionBar(olam); return true;
}
export function openTorahCodex(olam) { openSpellbook(olam); emitCodex(olam, true); return true; }
export { assignActionSlot };
export default { ensureTorahActionBar, emitTorahActionBar, unlockTorahSkill, castTorahSlot, openTorahCodex, assignActionSlot };
