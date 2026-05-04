
// B"H
/**
 * @file lifecycle.js
 * @description
 * 🌌 CHAPTER 8: THE DRAWING DOWN OF THE FORM (BRIYAH) 🌌
 * 
 * Chapter 801: The Wait of Recognition.
 * 
 * "Wait for the rain..." 
 * 
 * The user has decreed: We must wait for the model to load AFTER the first render 
 * and then offset its relative position significantly. 
 * 
 * THE DELAYED ANCHORING:
 * By waiting for two render pulses (requestAnimationFrame), we guarantee 
 * THREE.js has computed the actual world-space positions. 
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Medabeir from "../../medabeir/index.js";
 
export default {
 
    /**
     * @method heescheel
     */
    async heescheel(olam) {
        await Medabeir.prototype.heescheel.call(this, olam);
 
        if (!this.position || isNaN(this.position.x)) {
            // High altitude drop for dramatic grounding
            this.setPosition(new THREE.Vector3(0, 20, 0));
        }
 
        if (typeof this.setupInputListeners === 'function') {
            this.setupInputListeners(olam);
        }
    },
 
    /**
     * @method ready
     * @description
     * THE SOUL IS CONGEALED INTO MATTER.
     * Implementing the requested DEFERRED MEASUREMENT.
     */
    async ready() {
        await Medabeir.prototype.ready.call(this);
 
        if (this.olam) {
            this.olam.chossid = this;
            this.olam.player = this;
            if (this.olam.ayin) this.olam.ayin.target = this;
        }
 
        if (this.modelMesh) {
            this.modelMesh.traverse((child) => {
                if (child && child.isMesh) {
                    child.frustumCulled = false;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
 
            if (this.updateAppearance) this.updateAppearance();
        }
 
        /**
         * B"H: THE DEFERRED ANCHORING MANDATE
         * 
         * The User said: "wait for it to fully load after the first render 
         * then OFFSET its relative position."
         * 
         * This double-rAF ensures the matrices are finalized. 
         * ONLY THEN do we apply the heavy downward pull.
         */
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (!this.modelMesh) return;
 
                // B"H: Perform the holy measurement now that the matrices are ripe.
                if (typeof this.updateDimensionsFromModel === 'function') {
                    
                    // We seek the primary driver of the body bone if available
                    let driver = null;
                    this.modelMesh.traverse(n => {
                        if (n && n.name === 'body' && !driver) driver = n;
                    });
                    
                    // BRING THE MODEL DOWN SIGNIFICANTLY
                    this.updateDimensionsFromModel(driver || this.modelMesh);
                    // B"H: silent

                }
            });
        });
 
        // B"H: silent

    },
 
    /**
     * @method afterBriyah
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
     * @method started
     */
    async started() {
        this.iconPath = "chossid.svg";
        this.iconType = "centered";
        if (this.setupDefaultInventory) this.setupDefaultInventory();
    }
};
