// B"H
/**
 * @file lifecycle.js
 * @description
 * Chapter 20: The Lifecycle Pulled The Fresh Robe.
 *
 * The Awtsmoos refreshes the player lifecycle so the browser loads the new
 * measured GLB lift helper instead of the stale zero-lift burial helper.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Chai from "../../chai/index.js?v=direct-velocity-20260602-bh6";
import { ensureFallbackBody } from './lifecycle/fallbackBody.js';
import { prepareChossidModel } from './lifecycle/model.js?v=measured-visual-lift-20260602-bh6';

/** @param {object} chossid Player entity. @returns {void} */
function ensureVisibleChossidBody(chossid) {
    if (prepareChossidModel(chossid)) {
        ensureFallbackBody(chossid);
        return;
    }
    ensureFallbackBody(chossid);
}

export default {
    /** @param {object} olam World vessel that loads models. @returns {Promise<void>} */
    async heescheel(olam) {
        await Chai.prototype.heescheel.call(this, olam);
        if (!this.position || isNaN(this.position.x)) this.setPosition(new THREE.Vector3(0, 5, 10));
        if (typeof this.setupInputListeners === 'function') this.setupInputListeners(olam);
    },

    /** @returns {Promise<void>} */
    async ready() {
        await Chai.prototype.ready.call(this);
        registerPlayer(this);
        ensureVisibleChossidBody(this);
        this.inventory?.hydrateItems?.();
        if (this.optionsSpeed) this.speed = this.optionsSpeed;
        this.inventory?.updateUI?.();
        this.updateAppearance?.();
    },

    /** @returns {Promise<void>} */
    async afterBriyah() {
        await Chai.prototype.afterBriyah.call(this, this);
        ensureVisibleChossidBody(this);
        this.updateAppearance?.();
        if (this.olam) this.olam.ayshPeula("save player position");
        this.olam.on("wheel", ({ deltaY }) => {
            if (this.activeObject && this.setDistanceFromRay) {
                this.distanceFromRay += deltaY * 0.005;
                this.setDistanceFromRay(this.distanceFromRay);
            } else if (this.olam.ayin) this.olam.ayin.zoom(deltaY);
        });
    },

    /** @returns {Promise<void>|void} */
    async started() {
        this.iconPath = "chossid.svg";
        this.iconType = "centered";
        this.setupDefaultInventory?.();
    }
};

/** @param {object} chossid Player entity. @returns {void} */
function registerPlayer(chossid) {
    if (!chossid?.olam) return;
    chossid.olam.chossid = chossid;
    chossid.olam.player = chossid;
    if (!chossid.olam.ayin) return;
    chossid.olam.ayin.target = chossid;
    chossid.olam.ayin.currentDistance = 5;
    chossid.olam.ayin.desiredDistance = 5;
}
