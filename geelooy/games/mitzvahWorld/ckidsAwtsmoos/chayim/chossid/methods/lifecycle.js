// B"H
/**
 * @file lifecycle.js
 * @description
 * Chapter 1: The Capsule and the Untouched Garment.
 *
 * The player is a plain physics capsule for collision and motion. The GLB is
 * loaded by the same Medabeir/Domem path used by NPCs, then left alone as a
 * visual garment. No player-only GLB scaling, hiding, measuring, clothing
 * mutation, octree baking, or collider derivation happens here.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Medabeir from "../../medabeir/index.js";

export default {
    /**
     * Starts the Chossid by delegating to the exact Medabeir loading chain.
     * @param {object} olam - The world vessel that loads NPC/player models.
     * @returns {Promise<void>} Resolves after base living setup completes.
     */
    async heescheel(olam) {
        await Medabeir.prototype.heescheel.call(this, olam);

        if (!this.position || isNaN(this.position.x)) {
            this.setPosition(new THREE.Vector3(0, 20, 0));
        }

        if (typeof this.setupInputListeners === 'function') {
            this.setupInputListeners(olam);
        }
    },

    /**
     * Registers the player while preserving the loaded GLB exactly as received.
     * @returns {Promise<void>} Resolves after base readiness and inventory setup.
     */
    async ready() {
        await Medabeir.prototype.ready.call(this);

        if (this.olam) {
            this.olam.chossid = this;
            this.olam.player = this;
            if (this.olam.ayin) this.olam.ayin.target = this;
        }

        if (this.inventory && typeof this.inventory.hydrateItems === 'function') {
            this.inventory.hydrateItems();
        }

        if (this.optionsSpeed) this.speed = this.optionsSpeed;

        if (this.inventory && typeof this.inventory.updateUI === 'function') {
            this.inventory.updateUI();
        }
    },

    /**
     * Attaches non-visual player controls after creation.
     * @returns {Promise<void>} Resolves after inherited afterBriyah completes.
     */
    async afterBriyah() {
        await Medabeir.prototype.afterBriyah.call(this, this);
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
     * Initializes inventory and UI identity only; never touches the GLB.
     * @returns {Promise<void>|void}
     */
    async started() {
        this.iconPath = "chossid.svg";
        this.iconType = "centered";
        if (this.setupDefaultInventory) this.setupDefaultInventory();
    }
};
