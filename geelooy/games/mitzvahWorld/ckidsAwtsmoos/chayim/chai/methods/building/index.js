
/**
 * B"H
 * @module BuildingSystem
 * @description
 * THE CRAFT OF CREATION (MAASEH BERESHIT)
 * 
 * "In the beginning G-d created..."
 * This is the central coordinator for the building system.
 * It integrates Ghost generation, Placement, and Collection 
 * into a unified interface for the soul to interact with the world.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Ghost from "./Ghost.js";
import Placement from "./Placement.js";
import Collection from "./Collection.js";

export default {
    ...Ghost,
    ...Placement,
    ...Collection,

    getActiveItem() {
        if (!this.inventory || !this.inventory.equipment) return null;
        const ref = this.inventory.equipment.rightHand;
        if (!ref) return null;
        
        if (ref.className || ref.item) return ref;
        
        if (ref.sourceType !== undefined && ref.index !== undefined) {
            if (ref.sourceType === 'action') {
                return this.inventory.actionSlots ? this.inventory.actionSlots[ref.index] : null;
            } else if (ref.sourceType === 'inventory') {
                return this.inventory.slots ? this.inventory.slots[ref.index] : null;
            }
        }
        return null;
    },

    updateHandState() {
        const item = this.getActiveItem();
        
        if (item && item.isPainter && !this.olam.natureSystem) {
             import('../../../../dvarim/nature/natureSystem.js').then(m => {
                 this.olam.natureSystem = new m.default(this.olam);
             }).catch(e => console.error("B\"H: Failed to load NatureSystem", e));
        }
        
        if (this.olam.mouseDown && item && item.isPainter && this.activeRay && this.isPaintingMode) {
             const origin = this.getRayStart();
             const direction = this.getRayDirection();
             const ray = new THREE.Ray(origin, direction);
             const hit = this.olam.worldOctree.rayIntersect(ray);
             if (hit && hit.distance < 15 && this.olam.natureSystem) {
                 this.olam.natureSystem.paint(item.natureType, hit.position);
             }
        }

        const currentId = item ? (item.id || item.className) : "empty";
        if (this.lastItemId !== currentId) {
            this.lastItemId = currentId;
            this.isPaintingMode = false;
            this.removeActiveObject(); 
            this._isGeneratingGhost = false; 
        }

        if (!this.activeRay) return;

        if (item && (item.isBuildable || item.isPainter)) {
            if (!this.activeObject && !this._isGeneratingGhost) {
                this.placeBlockOnRay();
            } else if (this.activeObject && item.isPainter) {
                const mesh = this.activeObject.mesh;
                if (mesh) {
                    const color = this.isPaintingMode ? 0x00ff00 : 0xff0000;
                    mesh.traverse(c => {
                        if (c.isMesh && c.material) {
                            c.material.color.setHex(color);
                            c.material.opacity = this.isPaintingMode ? 0.8 : 0.3;
                            c.material.wireframe = !this.isPaintingMode;
                        }
                    });
                }
            }
        } else {
            this.removeActiveObject();
        }
    },

    async shoot() {
        if (!this.activeRay) return;
        const item = this.getActiveItem();
        
        if (item && item.isPainter) {
            if (this.isPaintingMode) {
                const origin = this.getRayStart();
                const direction = this.getRayDirection();
                const ray = new THREE.Ray(origin, direction);
                const hit = this.olam.worldOctree.rayIntersect(ray);
                if (hit && hit.distance < 15 && this.olam.natureSystem) {
                    this.olam.natureSystem.paint(item.natureType, hit.position);
                }
            }
            return;
        }

        if (item && item.isBuildable) {
            if (!this.activeObject) await this.placeBlockOnRay();
            else await this.placeObject();
        } else if (item && item.className === 'Tool') {
            if (this.activeObject) this.removeActiveObject();
            await this.collectObject();
        }
    },

    alignObject() {
        if (!this.activeRay || !this.activeRay.group || !this.activeObject) return;
        const finalQuaternion = new THREE.Quaternion();
        if (this.olam.ayin.isFPS) {
            const cameraEuler = new THREE.Euler().setFromQuaternion(this.olam.ayin.camera.quaternion, 'YXZ');
            const tiltCorrection = new THREE.Quaternion().setFromEuler(new THREE.Euler(cameraEuler.x, 0, 0));
            finalQuaternion.multiply(tiltCorrection);
        } 
        const userRotQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.placementRotation || 0);
        finalQuaternion.multiply(userRotQuat);
        this.activeObject.mesh.quaternion.copy(finalQuaternion);
    },

    removeActiveObject() {
        if (this.activeObject && this.activeObject.mesh) {
            if (this.activeObject.mesh.parent) this.activeObject.mesh.removeFromParent();
            this.olam.scene.remove(this.activeObject.mesh);
            this.activeObject = null;
        }
    },

    rotatePreview() {
        this.placementRotation = (this.placementRotation || 0) + Math.PI / 2;
        this.placementRotation %= (Math.PI * 2);
        this.alignObject();
    },

    resetPreviewRotation() {
        this.placementRotation = 0;
        this.alignObject();
    },
    
    setDistanceFromRay(distance) {
        this.distanceFromRay = distance;
        if (this.activeObject && this.activeObject.mesh) {
            this.activeObject.mesh.position.z = this.distanceFromRay;
        }
    }
};
