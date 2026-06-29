// B"H
/**
 * @file interaction.js
 * @description
 * Emergency repair for click intention. Friendly NPCs now receive the real
 * mouse button/context payload, so left-click targets and right-click can open
 * dialogue instead of the old broken second-left-click path.
 */
function explicitInteractionPayload(player, event = {}) {
  const button = Number.isFinite(Number(event?.button)) ? Number(event.button) : 0;
  const type = event?.type || (button === 2 ? "contextmenu" : "click");
  return {
    type,
    explicit: true,
    isPointer: true,
    isTap: false,
    isTouch: false,
    pointerType: "mouse",
    button,
    buttons: Number(event?.buttons || 0),
    contextMenu: button === 2 || type === "contextmenu",
    player,
    event,
    clientX: event?.clientX,
    clientY: event?.clientY
  };
}

function isInteractiveNivra(niv) {
  return niv?.type === "customNpc"
    || niv?.type === "medabeir"
    || niv?.type === "interactiveNpc"
    || niv?.type === "cottageDoor"
    || niv?.dialogue
    || niv?.dialogues
    || niv?.type === "interactiveDoor";
}

function ownerFromHit(ob, hit) {
  let cursor = hit?.nivraAwtsmoos || ob?.nivraAwtsmoos || ob;
  while (cursor && !cursor.nivraAwtsmoos && cursor.parent) cursor = cursor.parent;
  return cursor?.nivraAwtsmoos || hit?.nivraAwtsmoos || null;
}

function npcLike(niv) {
  return ["customNpc", "medabeir", "interactiveNpc"].includes(niv?.type);
}

function attackableNivra(niv) {
  const data = niv?.mesh?.userData || niv?.userData || {};
  if (!niv || isInteractiveNivra(niv) || npcLike(niv)) return false;
  if (data.friendly || data.peaceful || data.domestic || niv.friendly || niv.peaceful) return false;
  return Boolean(
    data.enemy || data.hostile || data.creature || data.wildlife || data.attackable ||
    niv.enemy || niv.hostile || niv.attackable || niv.type === "animal" || niv.type === "creature"
  );
}

function selectCombatTarget(player, niv, event = {}) {
  if (!attackableNivra(niv)) return false;
  if (player.combatTarget?.mesh) highlight(player.combatTarget.mesh, false);
  player.combatTarget = niv;
  player.olam.__selectedCombatTarget = niv;
  niv.__targetedAt = Date.now();
  highlight(niv.mesh, true, 0xdd3322);
  player.olam?.ayshPeula?.("ui event", "effectsOverlay", {
    text: `Target ${niv.name || niv.constructor?.itemName || "enemy"}. Use ATK/SWD/BOW to attack.`,
    color: "#ffcf6a"
  });
  event?.preventDefault?.();
  return true;
}

function setPointerFromEvent(olam, event = {}) {
  if (!olam || event.clientX === undefined) return;
  const rect = olam.boundingRect;
  if (!rect) return;
  olam.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  olam.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function highlight(rootObj, active, colorHex = 0x00ff00) {
  rootObj?.traverse?.(child => {
    if (!child.isMesh || !child.material) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach(mat => {
      if (!mat.emissive) return;
      mat.emissive.setHex(active ? colorHex : 0x000000);
      if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = active ? 0.6 : 1;
    });
  });
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
    const niv = this.intersected?.niv;
    if (!niv) {
      this.clearNpcTarget?.();
      return false;
    }
    if (isInteractiveNivra(niv)) {
      niv.ayshPeula?.("accepted interaction", explicitInteractionPayload(this, event));
      return true;
    }
    if (event.button !== 2 && selectCombatTarget(this, niv, event)) return true;
    this.selectIntersected?.();
    return true;
  },

  clearNpcTarget() {
    if (this.targetedNpc?.mesh) highlight(this.targetedNpc.mesh, false);
    if (this.combatTarget?.mesh) highlight(this.combatTarget.mesh, false);
    this.targetedNpc = null;
    this.combatTarget = null;
    if (this.olam) this.olam.__selectedCombatTarget = null;
  },

  async selectIntersected() {
    if (!this.intersected || this.selected) return;
    highlight(this.intersected.niv.mesh, true, 0xdd0022);
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
  setEntityHighlight(rootObj, active, colorHex = 0x00ff00) { highlight(rootObj, active, colorHex); },

  async checkHover(olam, nohtml = true) {
    if (!olam.isLookingForSomething) return;
    if (olam.isOverUI || this.state === "talking" || this.nivraTalkingTo) return this.removeIntersected();
    const hit = olam.ayin.getHovered(this.getRayStart(), this.getRayDirection());
    const niv = ownerFromHit(hit?.object, hit);
    if (this.intersected && this.intersected.niv !== niv) this.removeIntersected();
    if (!niv || niv.wasSealayked || niv.type === "chossid") return;
    if (this.intersected?.niv !== niv) {
      niv.ayshPeula?.("mouseEnter", this);
      this.intersected = { niv, ob: hit?.object, hit };
    }
    olam.hoveredNivra = niv;
    if (!nohtml && npcLike(niv)) {
      await olam.ayshPeula("ui event", "effectsOverlay", { text: `TARGET ${niv.name || "NPC"}`, color: "#ffd95a" });
    }
  }
};
