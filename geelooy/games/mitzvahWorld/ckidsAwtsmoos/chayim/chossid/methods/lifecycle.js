// B"H
/**
 * @file lifecycle.js
 * @description
 * Chapter 386: The lifecycle imports the exact-foot-measurement covenant.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Chai from "../../chai/index.js?v=exact-visual-feet-20260603-bh386";
import { ensureFallbackBody } from './lifecycle/fallbackBody.js';
import { prepareChossidModel } from './lifecycle/model.js?v=exact-feet-after-frame-20260603-bh386';

function ensureVisibleChossidBody(chossid) {
  if (prepareChossidModel(chossid)) { ensureFallbackBody(chossid); return; }
  ensureFallbackBody(chossid);
}

export default {
  async heescheel(olam) {
    await Chai.prototype.heescheel.call(this, olam);
    if (!this.position || isNaN(this.position.x)) this.setPosition(new THREE.Vector3(0, 5, 10));
    if (typeof this.setupInputListeners === 'function') this.setupInputListeners(olam);
  },

  async ready() {
    await Chai.prototype.ready.call(this);
    registerPlayer(this);
    ensureVisibleChossidBody(this);
    this.inventory?.hydrateItems?.();
    if (this.optionsSpeed) this.speed = this.optionsSpeed;
    this.inventory?.updateUI?.();
    this.updateAppearance?.();
  },

  async afterBriyah() {
    await Chai.prototype.afterBriyah.call(this, this);
    ensureVisibleChossidBody(this);
    this.updateAppearance?.();
    if (this.olam) this.olam.ayshPeula("save player position");
    this.olam.on("wheel", ({ deltaY }) => {
      if (this.activeObject && this.setDistanceFromRay) { this.distanceFromRay += deltaY * 0.005; this.setDistanceFromRay(this.distanceFromRay); }
      else if (this.olam.ayin) this.olam.ayin.zoom(deltaY);
    });
  },

  async started() {
    this.iconPath = "chossid.svg";
    this.iconType = "centered";
    this.setupDefaultInventory?.();
  }
};

function registerPlayer(chossid) {
  if (!chossid?.olam) return;
  chossid.olam.chossid = chossid;
  chossid.olam.player = chossid;
  if (!chossid.olam.ayin) return;
  chossid.olam.ayin.target = chossid;
  chossid.olam.ayin.currentDistance = 5;
  chossid.olam.ayin.desiredDistance = 5;
}
