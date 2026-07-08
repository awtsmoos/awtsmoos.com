// B"H
/** @file TorahActionBarState.js @description Owned 1-9 action slots for Torah passages and macros. */
import { quoteMove } from "../../tochen/torah/AbilityIndex.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ensureSpellbook, learnPassage } from "./TorahSpellbookRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const STARTER = ["shemaUnity", "amidahArrow", "tehillimSong", null, null, null, null, null, null];
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
export function ensureActionBarState(olam) {
  const p = playerOf(olam); if (!p) return null;
  ensureSpellbook(olam);
  p.torahActionBar ||= { slots: STARTER.map((id, i) => id ? { slot:i + 1, type:"passage", passageId:id } : { slot:i + 1, type:"empty" }), lastCastAt:0 };
  for (const id of STARTER.filter(Boolean)) learnPassage(olam, id, { silent:true });
  emitActionBar(olam); return p.torahActionBar;
}
export function assignActionSlot(olam, slotNumber, action) { const bar = ensureActionBarState(olam); const slot = Math.max(1, Math.min(9, Number(slotNumber) || 1)); bar.slots[slot - 1] = { slot, ...(action || { type:"empty" }) }; emitActionBar(olam); return bar.slots[slot - 1]; }
export function resolveActionSlot(olam, slotNumber) { const bar = ensureActionBarState(olam); const slot = bar?.slots?.[Number(slotNumber) - 1]; if (!slot || slot.type === "empty") return null; if (slot.type === "passage") return { ...slot, passage:quoteMove(slot.passageId) }; return slot; }
export function actionBarPayload(olam) { const bar = ensureActionBarState(olam); return { slots:(bar?.slots || []).map(s => s.type === "passage" ? { ...s, passage:quoteMove(s.passageId) } : s) }; }
export function emitActionBar(olam) { const p = playerOf(olam); if (!p?.torahActionBar) return false; const payload = { slots:p.torahActionBar.slots.map(s => s.type === "passage" ? { ...s, passage:quoteMove(s.passageId) } : s) }; olam?.ayshPeula?.("ui event", "torahActionBar", payload); olam?.ayshPeula?.("ui event", "skillBar", { updateSkills:payload.slots.filter(s => s.passage).map(s => ({ ...s.passage, slot:s.slot })) }); return payload; }
export default { ensureActionBarState, assignActionSlot, resolveActionSlot, actionBarPayload, emitActionBar };
