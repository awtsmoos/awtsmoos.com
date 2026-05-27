// B"H
/**
 * @file lifecycle.js
 * @description
 * Player lifecycle safety for the desert smoke test.
 *
 * The player may use a GLB or a generated mesh, but the camera/physics follow
 * the Chai empty vessel after ready(). Therefore we always attach one simple
 * visible body to that vessel so the Chossid can never disappear while the
 * rest of the loading system is being repaired.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Medabeir from "../../medabeir/index.js";

function ensureVisibleChossidBody(chossid) {
    if (!chossid || !chossid.mesh || !chossid.mesh.isObject3D) return;

    let existing = chossid.mesh.getObjectByName?.('BASIC_VISIBLE_CHOSSID_BODY');
    if (existing) {
        existing.visible = true;
        return;
    }

    const body = new THREE.Group();
    body.name = 'BASIC_VISIBLE_CHOSSID_BODY';

    const robe = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 1.45, 0.55),
        new THREE.MeshLambertMaterial({ color: 0x1f6fff })
    );
    robe.name = 'BASIC_VISIBLE_CHOSSID_ROBE';
    robe.position.y = 0.8;
    robe.castShadow = true;
    robe.receiveShadow = true;

    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.45, 0.45),
        new THREE.MeshLambertMaterial({ color: 0xf1d0a8 })
    );
    head.name = 'BASIC_VISIBLE_CHOSSID_HEAD';
    head.position.y = 1.75;
    head.castShadow = true;
    head.receiveShadow = true;

    const hat = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.22, 0.65),
        new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    hat.name = 'BASIC_VISIBLE_CHOSSID_HAT';
    hat.position.y = 2.08;
    hat.castShadow = true;
    hat.receiveShadow = true;

    body.add(robe, head, hat);
    body.userData.isLiving = true;
    body.userData.isPlayerFallback = true;
    body.traverse(child => {
        child.userData.isLiving = true;
        child.frustumCulled = false;
        child.nivraAwtsmoos = chossid;
    });

    chossid.mesh.add(body);
}

export default {
    /**
     * Starts the Chossid by delegating to the exact Medabeir loading chain.
     * @param {object} olam - The world vessel that loads NPC/player models.
     * @returns {Promise<void>} Resolves after base living setup completes.
     */
    async heescheel(olam) {
        await Medabeir.prototype.heescheel.call(this, olam);

        if (!this.position || isNaN(this.position.x)) {
            this.setPosition(new THREE.Vector3(0, 5, 10));
        }

        if (typeof this.setupInputListeners === 'function') {
            this.setupInputListeners(olam);
        }
    },

    /**
     * Registers the player and guarantees a visible fallback body on the physics vessel.
     * @returns {Promise<void>} Resolves after base readiness and inventory setup.
     */
    async ready() {
        await Medabeir.prototype.ready.call(this);

        if (this.olam) {
            this.olam.chossid = this;
            this.olam.player = this;
            if (this.olam.ayin) {
                this.olam.ayin.target = this;
                this.olam.ayin.currentDistance = 5;
                this.olam.ayin.desiredDistance = 5;
            }
        }

        ensureVisibleChossidBody(this);

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
        ensureVisibleChossidBody(this);

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
