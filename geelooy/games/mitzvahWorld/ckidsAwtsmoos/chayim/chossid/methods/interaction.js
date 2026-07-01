// B"H
/**
 * @file interaction.js
 * @purpose Handles click selection, NPC first-click targeting, and second-click talk.
 * @owner Live Chossid interaction runtime.
 * @inputs Pointer events, hover ray hits, NPC/combat policies, and Olam UI channel.
 * @outputs Target highlights, accepted interactions, selected objects, and UI hints.
 * @runtimeAuthority Canonical Chossid click/tap interaction path.
 * @updateOrder Pointer normalization, hover update, NPC policy, interact/combat fallback.
 * @callers Chossid browser input listeners.
 * @invariants First NPC click targets; second click opens talk without combat drift.
 * @failureModes Missing target clears state and returns false.
 */
import { clearCombatTarget, highlightTarget, isInteractiveTarget, isNpcTarget, selectCombatTarget } from "./ClickTargetPolicy.js?v=click-target-policy-20260629-bh1";
import { explainNpcWait, npcInteractionDecision, selectNpcTarget } from "../../../dvarim/npc/NpcTargetRuntime.js?v=npc-visible-target-20260628-bh1";

function explicitInteractionPayload(player, event = {}) {
  const button = Number.isFinite(Number(event?.button)) ? Number(event.button) : 0;
  const type = event?.type || (button === 2 ? "contextmenu" : "click");
  const isTouch = event?.isTouch === true || event?.pointerType === "touch" || String(type).includes("touch");
  return { type, explicit: true, isPointer: true, isTap: Boolean(event?.isTap || isTouch), isTouch,
    pointerType: isTouch ? "touch" : "mouse", button, buttons: Number(event?.buttons || 0),
    contextMenu: button === 2 || type === "contextmenu", player, event, clientX: event?.clientX, clientY: event?.clientY };
}
function ownerFromHit(object, hit) { let cursor = hit?.nivraAwtsmoos || object?.nivraAwtsmoos || object; while (cursor && !cursor.nivraAwtsmoos && cursor.parent) cursor = cursor.parent; return cursor?.nivraAwtsmoos || hit?.nivraAwtsmoos || null; }
function setPointerFromEvent(olam, event = {}) { if (!olam || event.clientX === undefined) return; const r = olam.boundingRect; if (!r) return; olam.pointer.x = ((event.clientX - r.left) / r.width) * 2 - 1; olam.pointer.y = -((event.clientY - r.top) / r.height) * 2 + 1; }
function openInteractiveTarget(player, niv, event) { if (typeof niv.ayshPeula === "function") niv.ayshPeula("accepted interaction", explicitInteractionPayload(player, event)); return true; }
function tell(olam, text, color = "#8de8ff") { return olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color }); }

export default {
  actionList: {
    Delete(self) { self?.selected?.niv?.ayshPeula("sealayk"); },
    Grab(self) { self?.selected?.niv?.ayshPeula("sealayk"); self.removeIntersected(); self.makeRay?.(); self.placeBlockOnRay?.(); }
  },
  handleClick(event = {}) {
    event?.preventDefault?.(); setPointerFromEvent(this.olam, event); this.checkHover?.(this.olam, true);
    const niv = this.intersected?.niv;
    if (!niv) { this.clearNpcTarget?.(); return false; }
    if (isNpcTarget(niv)) {
      const payload = explicitInteractionPayload(this, event);
      const decision = npcInteractionDecision(niv, payload);
      if (this.targetedNpc !== niv) {
        this.clearNpcTarget(); this.targetedNpc = niv; highlightTarget(niv.mesh, true, 0xffd95a); selectNpcTarget(niv, payload);
        tell(this.olam, decision.action === "wait" ? explainNpcWait(niv, payload) : "Click again to talk", "#8de8ff");
        return true;
      }
      this.clearNpcTarget(); return openInteractiveTarget(this, niv, event);
    }
    if (isInteractiveTarget(niv)) return openInteractiveTarget(this, niv, event);
    if (event.button !== 2 && selectCombatTarget(this, niv, event)) return true;
    this.selectIntersected?.(); return true;
  },
  clearNpcTarget() { if (this.targetedNpc?.mesh) highlightTarget(this.targetedNpc.mesh, false); this.targetedNpc = null; clearCombatTarget(this); },
  async selectIntersected() { if (!this.intersected || this.selected) return; highlightTarget(this.intersected.niv.mesh, true, 0xdd0022); this.selected = this.intersected; await tell(this.olam, "SELECTED", "#ffd95a"); },
  removeIntersected() { this.intersected?.niv?.ayshPeula?.("mouseLeave", this); this.olam.hoveredNivra = null; this.intersected = null; this.selected = null; },
  toggleSelectedMenu() {}, selectMenuOption() {},
  setEntityHighlight(rootObj, active, colorHex = 0x00ff00) { highlightTarget(rootObj, active, colorHex); },
  async checkHover(olam, nohtml = true) {
    if (!olam.isLookingForSomething) return;
    if (olam.isOverUI || this.state === "talking" || this.nivraTalkingTo) return this.removeIntersected();
    const hit = olam.ayin.getHovered(this.getRayStart(), this.getRayDirection());
    const niv = ownerFromHit(hit?.object, hit);
    if (this.intersected && this.intersected.niv !== niv) this.removeIntersected();
    if (!niv || niv.wasSealayked || niv.type === "chossid") return;
    if (this.intersected?.niv !== niv) { niv.ayshPeula?.("mouseEnter", this); this.intersected = { niv, ob: hit?.object, hit }; }
    olam.hoveredNivra = niv;
    if (!nohtml && isNpcTarget(niv)) await tell(olam, `TARGET ${niv.name || "NPC"}`, "#ffd95a");
  }
};
