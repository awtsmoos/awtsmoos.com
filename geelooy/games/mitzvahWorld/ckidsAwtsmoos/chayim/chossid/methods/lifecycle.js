
// B"H
/**
 * @file lifecycle.js
 * @description
 * The Chossid render model is only a garment. Physics remains a small capsule,
 * never the whole GLB, never a debug Box3Helper, and never an octree-baked
 * triangle body. This keeps player motion smooth even when the visual mesh has
 * stray bones, clothing, or far-away vertices.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Medabeir from "../../medabeir/index.js";
import { PHYSICS_CONSTANTS } from "../../chai/methods/physics/physicsConstants.js";
 
export default {
    async heescheel(olam) {
        await Medabeir.prototype.heescheel.call(this, olam);
 
        if (!this.position || isNaN(this.position.x)) {
            this.setPosition(new THREE.Vector3(0, 20, 0));
        }
 
        if (typeof this.setupInputListeners === 'function') {
            this.setupInputListeners(olam);
        }
    },
 
    async ready() {
        await Medabeir.prototype.ready.call(this);
 
        if (this.olam) {
            this.olam.chossid = this;
            this.olam.player = this;
            if (this.olam.ayin) this.olam.ayin.target = this;
        }
 
        this.height = PHYSICS_CONSTANTS.DEFAULT_HEIGHT;
        this.radius = PHYSICS_CONSTANTS.DEFAULT_RADIUS;
        this.visualYOffset = -this.height;

        if (this.collider) {
            this.collider.radius = this.radius;
            this.collider.start.set(0, this.height, 0);
            this.collider.end.set(0, this.height, 0);
        }
 
        if (this.modelMesh) {
            this.modelMesh.userData.isLiving = true;
            this.modelMesh.userData.skipOctree = true;
            this.modelMesh.userData.isPlayerModel = true;
            this.modelMesh.traverse((child) => {
                child.userData = child.userData || {};
                child.userData.isLiving = true;
                child.userData.skipOctree = true;
                child.userData.isPlayerModel = true;
                if (child && child.isMesh) {
                    child.frustumCulled = false;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
 
            if (this.updateAppearance) this.updateAppearance();
        }
    },
 
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
 
    async started() {
        this.iconPath = "chossid.svg";
        this.iconType = "centered";
        if (this.setupDefaultInventory) this.setupDefaultInventory();
    }
};
