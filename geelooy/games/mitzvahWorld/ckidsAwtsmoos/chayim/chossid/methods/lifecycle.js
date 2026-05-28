// B"H
/**
 * @file lifecycle.js
 * @description
 * Chapter 1: The player stands alone at the quiet gate.
 *
 * The Awtsmoos speaks the first level into being through a single Chossid,
 * without summoning the Medabeir/NPC chain. This lifecycle intentionally calls
 * the direct Chai base methods, so ShopManager, NpcRandomizer, SiachManager,
 * and the older speaker-world imports stay outside the hot platformer path.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Chai from "../../chai/index.js";
import { ensureFallbackBody } from './lifecycle/fallbackBody.js';
import { prepareChossidModel } from './lifecycle/model.js';

/**
 * Ensures the visible player body exists.
 *
 * @param {object} chossid Player entity.
 * @returns {void}
 */
function ensureVisibleChossidBody(chossid) {
    if (prepareChossidModel(chossid)) {
        ensureFallbackBody(chossid);
        return;
    }
    ensureFallbackBody(chossid);
}

export default {
    /**
     * Starts the Chossid through Chai only, avoiding the old NPC chain.
     *
     * @param {object} olam World vessel that loads models.
     * @returns {Promise<void>} Resolves after base living setup.
     */
    async heescheel(olam) {
        await Chai.prototype.heescheel.call(this, olam);
        if (!this.position || isNaN(this.position.x)) {
            this.setPosition(new THREE.Vector3(0, 5, 10));
        }
        if (typeof this.setupInputListeners === 'function') {
            this.setupInputListeners(olam);
        }
    },

    /**
     * Registers the player and prepares the GLB overlay.
     *
     * @returns {Promise<void>} Resolves after readiness and inventory setup.
     */
    async ready() {
        await Chai.prototype.ready.call(this);
        registerPlayer(this);
        ensureVisibleChossidBody(this);
        this.inventory?.hydrateItems?.();
        if (this.optionsSpeed) this.speed = this.optionsSpeed;
        this.inventory?.updateUI?.();
        this.updateAppearance?.();
    },

    /**
     * Attaches non-visual player controls after creation.
     *
     * @returns {Promise<void>} Resolves after inherited afterBriyah.
     */
    async afterBriyah() {
        await Chai.prototype.afterBriyah.call(this, this);
        ensureVisibleChossidBody(this);
        this.updateAppearance?.();
        if (this.olam) this.olam.ayshPeula("save player position");
        this.olam.on("wheel", ({ deltaY }) => {
            if (this.activeObject && this.setDistanceFromRay) {
                this.distanceFromRay += deltaY * 0.005;
                this.setDistanceFromRay(this.distanceFromRay);
            } else if (this.olam.ayin) {
                this.olam.ayin.zoom(deltaY);
            }
        });
    },

    /**
     * Initializes inventory and UI identity.
     *
     * @returns {Promise<void>|void} Completion signal.
     */
    async started() {
        this.iconPath = "chossid.svg";
        this.iconType = "centered";
        this.setupDefaultInventory?.();
    }
};

/**
 * Registers the Chossid as the world player and camera target.
 *
 * @param {object} chossid Player entity.
 * @returns {void}
 */
function registerPlayer(chossid) {
    if (!chossid?.olam) return;
    chossid.olam.chossid = chossid;
    chossid.olam.player = chossid;
    if (!chossid.olam.ayin) return;
    chossid.olam.ayin.target = chossid;
    chossid.olam.ayin.currentDistance = 5;
    chossid.olam.ayin.desiredDistance = 5;
}
