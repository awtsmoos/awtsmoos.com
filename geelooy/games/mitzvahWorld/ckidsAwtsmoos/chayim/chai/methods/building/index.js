
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
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import Ghost from "./Ghost.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import Placement from "./Placement.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import Collection from "./Collection.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as AWTSMOOS from '../../../../awtsmoosCkidsGames.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

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
             import('../../../../dvarim/nature/natureSystem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1').then(m => {
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
        } else if (item && (item.className === 'Tool' || item.type === 'tool' || item.isTool)) {
            if (this.activeObject) this.removeActiveObject();
            
            // B"H: Dynamically instantiate the Tool class and call its unique action
            const ToolClass = AWTSMOOS[item.className];
            if (ToolClass && typeof ToolClass.prototype.shoot === 'function') {
                const toolInst = new ToolClass(item, this.olam);
                // Synchronize custom state if it was mutated
                if (item.customData) toolInst.customData = item.customData;
                
                await toolInst.shoot();
                
                // Save back any mutated state
                item.customData = toolInst.customData || item.customData;
                return;
            }

            // Fallback if no specific shoot logic is implemented
            if (item.className === 'Tool') {
                await this.collectObject();
            }
        } else if (item && (item.className === 'Sefer' || item.type === 'Sefer')) {
            if (this.activeObject) this.removeActiveObject();
            // B"H: Fire the Hebrew Letters!
            if (typeof this.shootHebrewLetter === 'function') {
                this.shootHebrewLetter();
            }
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
