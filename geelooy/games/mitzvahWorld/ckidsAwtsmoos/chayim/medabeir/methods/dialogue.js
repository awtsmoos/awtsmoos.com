// B"H
/**
 * @file dialogue.js
 * @description
 * Chapter 6: Speech no longer opens a shop before a player exists. The
 * Awtsmoos revealed the crash: Medabeir.ready called handleDialogue with no
 * Chossid, then ShopManager read `currency` from undefined. This gate now
 * refuses empty actors and lets special NPC subclasses handle their own menus.
 */
import SiachManager from "./Siach/SiachManager.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import ShopManager from "./Siach/ShopManager.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function validActor(chossid) {
  return Boolean(chossid && (chossid.type === "chossid" || chossid.inventory || chossid.mesh));
}

export default {
  handleDialogue(chossid) {
    if (typeof this.openGuideMenu === "function") return this.openGuideMenu(chossid);
    if (!validActor(chossid)) return false;
    if (this.options?.hasShop) {
      if (!this.shopManager) this.shopManager = new ShopManager(this, this.olam);
      this.state = "talking";
      this.shopManager.openShop(chossid);
      return true;
    }
    if (!this.siach) this.siach = new SiachManager(this, this.olam);
    this.state = "talking";
    this.siach.begin(chossid);
    return true;
  },

  dialogueControls(e) {
    const k = e.key;
    if (this.state !== "talking" || !this.siach) return;
    const choice = parseInt(k, 10);
    if (!Number.isNaN(choice) && choice > 0 && choice <= 9) this.siach.choose(choice - 1);
  },

  chooseResponse(index) {
    if (this.siach) this.siach.choose(index);
  },

  resetDialogueState() {
    if (this.siach) this.siach.end();
    if (this.shopManager) this.shopManager.closeShop();
    this.state = "idle";
  },

  "accepted interaction"(chossid) {
    return this.handleDialogue(chossid);
  }
};
