// B"H
/**
 * @file interaction.js
 * @description
 * Chapter 143: The Chossid tells the guide when a click is truly a click.
 *
 * The guide highlighted because hover worked, but the actual click payload was
 * only `this` (the player object), not an explicit tap signal. The tap-only NPC
 * correctly rejected it. Now accepted interaction receives both the player and
 * explicit click metadata, while passive hover remains silent.
 */

function explicitInteractionPayload(player, event = {}) {
  return {
    type: "click",
    explicit: true,
    isPointer: true,
    player,
    event,
    clientX: event?.clientX,
    clientY: event?.clientY
  };
}
function isInteractiveNivra(niv) {
  return niv?.type === "customNpc" ||
    niv?.type === "medabeir" ||
    niv?.type === "interactiveNpc" ||
    niv?.dialogue ||
    niv?.dialogues ||
    niv?.type === "interactiveDoor";
}
function hoveredOwner(ob, hit) {
  let niv = hit?.nivraAwtsmoos || ob?.nivraAwtsmoos;
  if (niv || !ob) return niv;
  let p = ob;
  while (p && !p.nivraAwtsmoos && p.parent) p = p.parent;
  return p?.nivraAwtsmoos || null;
}

export default {
  actionList: {
    Delete(self) { self?.selected?.niv?.ayshPeula("sealayk"); },
    Grab(self) {
      self?.selected?.niv?.ayshPeula("sealayk");
      self.removeIntersected();
      self.selected = null;
      self.intersected = null;
      self.removeRay();
      self.makeRay();
      self.placeBlockOnRay();
    }
  },

  handleClick(e) {
    if (this.olam) {
      if (e?.clientX !== undefined) {
        const rect = this.olam.boundingRect;
        if (rect) {
          this.olam.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          this.olam.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        }
      }
      this.checkHover(this.olam, true);
    }

    if (this.intersected?.niv) {
      const niv = this.intersected.niv;
      if (isInteractiveNivra(niv)) {
        if (typeof niv.ayshPeula === "function") niv.ayshPeula("accepted interaction", explicitInteractionPayload(this, e));
        return;
      }
      this.selectIntersected();
      return;
    }

    if (typeof this.shoot === "function") this.shoot();
  },

  async selectIntersected() {
    if (!this.intersected || this.selected) return;
    this.setEntityHighlight(this.intersected.niv.mesh, true, 0xdd0022);
    this.selected = this.intersected;
    this.olam.htmlAction({ shaym: "block selector menu", methods: { classList: { remove: "hidden" } } });
    await this.olam.ayshPeula("ui event", "block selector menu", { awtsmoosOptions: { lol: 5 } });
  },

  removeIntersected() {
    if (this.intersected?.niv) {
      this.intersected.niv.isHoveredOver = false;
      if (typeof this.intersected.niv.ayshPeula === "function") this.intersected.niv.ayshPeula("mouseLeave", this);
    }
    this.olam.hoveredNivra = null;
    this.intersected = null;
    this.selected = null;
    this.olam.htmlAction({ shaym: "block selector menu", methods: { classList: { add: ["hidden"] } } });
    this.olam.htmlAction({ shaym: "minimap label", methods: { classList: { add: "invisible" } } });
    this.olam.htmlAction({ selector: "body", properties: { style: { cursor: "default" } } });
    this.olam.htmlAction({ shaym: "approach npc msg", methods: { classList: { add: "hidden" } } });
  },

  toggleSelectedMenu() {
    if (!this.currentSelectOption) this.currentSelectOption = "Grab";
    this.olam.ayshPeula("ui event", "menu item " + this.currentSelectOption, { awtsmoosHighlight: "yes" });
  },

  selectMenuOption() {
    this.olam.ayshPeula("ui event", "menu item " + this.currentSelectOption, { awtsmoosHighlight: "yes" });
  },

  setEntityHighlight(rootObj, active, colorHex = 0x00ff00) {
    if (!rootObj) return;
    rootObj.traverse(child => {
      if (!child.isMesh || !child.material) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      if (active) {
        if (!child.userData.savedEmissive) {
          child.userData.savedEmissive = materials.map(m => m.emissive ? m.emissive.getHex() : 0);
          child.userData.savedIntensity = materials.map(m => m.emissiveIntensity !== undefined ? m.emissiveIntensity : 1);
        }
        materials.forEach(m => {
          if (m.emissive) {
            m.emissive.setHex(colorHex);
            if (m.emissiveIntensity !== undefined) m.emissiveIntensity = 0.6;
          }
        });
        return;
      }
      if (child.userData.savedEmissive) {
        materials.forEach((m, i) => {
          if (m.emissive) m.emissive.setHex(child.userData.savedEmissive[i]);
          if (m.emissiveIntensity !== undefined) m.emissiveIntensity = child.userData.savedIntensity[i];
        });
        delete child.userData.savedEmissive;
        delete child.userData.savedIntensity;
      } else materials.forEach(m => { if (m.emissive) m.emissive.setHex(0); });
    });
  },

  async checkHover(olam, nohtml = true) {
    if (!olam.isLookingForSomething) return;
    if (olam.isOverUI || (olam.chossid && (olam.chossid.state === "talking" || olam.chossid.nivraTalkingTo))) {
      if (!nohtml) {
        olam.htmlAction({ shaym: "approach npc msg", methods: { classList: { add: "hidden" } } });
        olam.htmlAction({ selector: "body", properties: { style: { cursor: "default" } } });
      }
      this.removeIntersected();
      return;
    }

    const hit = olam.ayin.getHovered(this.getRayStart(), this.getRayDirection());
    const ob = hit?.object;
    const niv = hoveredOwner(ob, hit);

    if (this.intersected && this.intersected.niv !== niv) this.removeIntersected();

    if (niv && !niv.wasSealayked && niv.type !== "chossid") {
      niv.isHoveredOver = true;
      if (this.intersected?.niv !== niv) {
        if (typeof niv.ayshPeula === "function") niv.ayshPeula("mouseEnter", this);
        this.intersected = { niv, ob, hit };
        olam.hoveredNivra = niv;
        if (!nohtml) olam.htmlAction({ selector: "body", properties: { style: { cursor: "pointer" } } });
      }

      const isNPC = niv.type === "customNpc" || niv.type === "medabeir" || niv.type === "interactiveNpc";
      if ((niv.dialogue || niv.dialogues || ob?.hasDialogue || isNPC) && !nohtml) {
        let inRange = false;
        if (isNPC && olam.chossid) inRange = olam.chossid.mesh.position.distanceTo(niv.mesh.position) <= (niv.proximity || 5);
        else inRange = hit.distance < 10;
        const msg = `B"H\n${niv.name || "Friend"}${!inRange && isNPC ? "\n(Get closer to talk)" : isNPC ? "\n(Click or Press C to Talk)" : ""}`;
        await olam.htmlAction({ shaym: "minimap label", properties: { innerHTML: msg, style: { transform: `translate(${olam.achbar.x}px, ${olam.achbar.y}px)` } }, methods: { classList: { remove: "invisible" } } });
        if (isNPC) await olam.htmlAction({ shaym: "approach npc msg", properties: inRange ? { textContent: niv.name } : {}, methods: { classList: { [inRange ? "remove" : "add"]: "hidden" } } });
      }
      olam.hoveredNivra = niv;
      return;
    }

    if (this.intersected) this.removeIntersected();
    olam.hoveredNivra = niv;
  }
};
