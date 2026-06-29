// B"H
/**
 * @file interaction.js
 * @description
 * The player click covenant: hover discovers, click selects, right-click opens
 * friendly talk/doors, and attacks happen only through explicit combat actions.
 */
import {
  clearCombatTarget,
  highlightTarget,
  isInteractiveTarget,
  isNpcTarget,
  selectCombatTarget
} from "./ClickTargetPolicy.js?v=click-target-policy-20260629-bh1";
import {
  explainNpcWait,
  npcInteractionDecision,
  selectNpcTarget
} from "../../../dvarim/npc/NpcTargetRuntime.js?v=npc-visible-target-20260628-bh1";

function explicitInteractionPayload(player, event = {}) {
  const button = Number.isFinite(Number(event?.button)) ? Number(event.button) : 0;
  const type = event?.type || (button === 2 ? "contextmenu" : "click");
  const isTouch = event?.isTouch === true || event?.pointerType === "touch" || String(type).includes("touch");
  return {
    type,
    explicit: true,
    isPointer: true,
    isTap: Boolean(event?.isTap || isTouch),
    isTouch,
    pointerType: isTouch ? "touch" : "mouse",
    button,
    buttons: Number(event?.buttons || 0),
    contextMenu: button === 2 || type === "contextmenu",
    player,
    event,
    clientX: event?.clientX,
    clientY: event?.clientY
  };
}

function ownerFromHit(object, hit) {
  let cursor = hit?.nivraAwtsmoos || object?.nivraAwtsmoos || object;
  while (cursor && !cursor.nivraAwtsmoos && cursor.parent) cursor = cursor.parent;
  return cursor?.nivraAwtsmoos || hit?.nivraAwtsmoos || null;
}

function setPointerFromEvent(olam, event = {}) {
  if (!olam || event.clientX === undefined) return;
  const rect = olam.boundingRect;
  if (!rect) return;
  olam.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  olam.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function openInteractiveTarget(player, target, event) {
  target.ayshPeula?.("accepted interaction", explicitInteractionPayload(player, event));
  return true;
}

export default {
  actionList: {
    Delete(self) { self?.selected?.niv?.ayshPeula("sealayk"); },
    Grab(self) {
      self?.selected?.niv?.ayshPeula("sealayk");
      self.removeIntersected();
      self.makeRay?.();
      self.placeBlockOnRay?.();
    }
  },

  handleClick(event = {}) {
    event?.preventDefault?.();
    setPointerFromEvent(this.olam, event);
    this.checkHover?.(this.olam, true);

    const target = this.intersected?.niv;
    if (!target) {
      this.clearNpcTarget?.();
      return false;
    }

    if (isNpcTarget(target)) {
      const payload = explicitInteractionPayload(this, event);
      const decision = npcInteractionDecision(target, payload);
      if (decision.action === "open") return openInteractiveTarget(this, target, event);
      selectNpcTarget(target, payload);
      if (decision.action === "wait") {
        this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: explainNpcWait(target, payload), color: "#8de8ff" });
      }
      return true;
    }
    if (isInteractiveTarget(target)) return openInteractiveTarget(this, target, event);
    if (event.button !== 2 && selectCombatTarget(this, target, event)) return true;
    this.selectIntersected?.();
    return true;
  },

  clearNpcTarget() {
    if (this.targetedNpc?.mesh) highlightTarget(this.targetedNpc.mesh, false);
    this.targetedNpc = null;
    clearCombatTarget(this);
  },

  async selectIntersected() {
    if (!this.intersected || this.selected) return;
    highlightTarget(this.intersected.niv.mesh, true, 0xdd0022);
    this.selected = this.intersected;
    await this.olam.ayshPeula("ui event", "effectsOverlay", { text: "SELECTED", color: "#ffd95a" });
  },

  removeIntersected() {
    this.intersected?.niv?.ayshPeula?.("mouseLeave", this);
    this.olam.hoveredNivra = null;
    this.intersected = null;
    this.selected = null;
  },

  toggleSelectedMenu() {},
  selectMenuOption() {},
  setEntityHighlight(rootObj, active, colorHex = 0x00ff00) { highlightTarget(rootObj, active, colorHex); },

  async checkHover(olam, nohtml = true) {
    if (!olam.isLookingForSomething) return;
    if (olam.isOverUI || this.state === "talking" || this.nivraTalkingTo) return this.removeIntersected();

    const hit = olam.ayin.getHovered(this.getRayStart(), this.getRayDirection());
    const target = ownerFromHit(hit?.object, hit);
    if (this.intersected && this.intersected.niv !== target) this.removeIntersected();
    if (!target || target.wasSealayked || target.type === "chossid") return;

    if (this.intersected?.niv !== target) {
      target.ayshPeula?.("mouseEnter", this);
      this.intersected = { niv: target, ob: hit?.object, hit };
    }

    olam.hoveredNivra = target;
    if (!nohtml && isNpcTarget(target)) {
      await olam.ayshPeula("ui event", "effectsOverlay", { text: `TARGET ${target.name || "NPC"}`, color: "#ffd95a" });
    }
  }
};
