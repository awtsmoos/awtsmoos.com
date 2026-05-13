// B"H
/**
 * @file lifecycle.js
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE JOURNEY OF EXISTENCE — Creation and Sustenance        ║
 * ║                                                             ║
 * ║  "Blessed is your coming in, and blessed is your going out"║
 * ║  (Devarim 28:6)                                             ║
 * ║                                                             ║
 * ║  The sacred cycle of the Threshold's manifestation in time ║
 * ║  and space, from its first breath to its constant motion.  ║
 * ╚═══════════════════════════════════════════════════════════╝
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { DOOR_DEFAULTS } from '../constants.js';

export default {
    /**
     * @method heescheel
     * @description Initialization in the world — builds geometry and registers.
     */
    async heescheel(olam) {
        this.olam = olam;
        await this._superHeescheel(olam);

        if (!this.mesh || !this.mesh.geometry || this.mesh.geometry.attributes.position.count < 30) {
            const geo = this.buildGeometryManually();
            const matArray = [
                new THREE.MeshLambertMaterial({ color: "#4e342e" }),
                new THREE.MeshStandardMaterial({ color: "#FFD700", metalness: 1.0, roughness: 0.1 })
            ];

            if (this.mesh && this.mesh.parent) {
                const par = this.mesh.parent;
                par.remove(this.mesh);
                this.mesh = new THREE.Mesh(geo, matArray);
                par.add(this.mesh);
            } else {
                this.mesh = new THREE.Mesh(geo, matArray);
            }
        }

        this.mesh.name = this.name || "Interactive Gateway";
        this.mesh.nivraAwtsmoos = this;

        if (this.position) {
            this.mesh.position.copy(
                this.position.vector3 ? this.position.vector3() : this.position
            );
        }
        this.mesh.rotation.y = this.baseRotY;

        this.mesh.userData.isSolid = true;
        this.isSolid = true;

        await olam.hoyseef(this);

        if (this.olam.interactiveOctree) {
            this.olam.interactiveOctree.fromGraphNode(this.mesh);
        }

        this.isReady = true;
    },

    /**
     * @method heesHawvoos
     * @description Per-frame update — smoothly lerps toward target angle.
     */
    heesHawvoos(dt) {
        this._superHeesHawvoos(dt);

        if (!this.mesh || !this._isMoving) return;

        const diff = this.targetAngle - this.currentAngle;

        if (Math.abs(diff) > DOOR_DEFAULTS.angleThreshold) {
            if (!this._removedFromOctree) {
                if (this.isSolid && this.olam && this.olam.worldOctree) {
                    this.olam.worldOctree.removeMesh(this.mesh);
                    this._removedFromOctree = true;
                }
            }

            this.currentAngle = THREE.MathUtils.lerp(
                this.currentAngle,
                this.targetAngle,
                dt * DOOR_DEFAULTS.lerpSpeed
            );
            this.mesh.rotation.y = this.baseRotY + this.currentAngle;
            this.mesh.updateMatrixWorld(true);
        } else {
            this.currentAngle = this.targetAngle;
            this.mesh.rotation.y = this.baseRotY + this.currentAngle;
            this.mesh.updateMatrixWorld(true);

            if (this._removedFromOctree) {
                if (this.isSolid && this.olam && this.olam.worldOctree) {
                    this.olam.worldOctree.addObject(this.mesh);
                    this._removedFromOctree = false;
                }
            }

            this._isMoving = false;
        }
    }
};
