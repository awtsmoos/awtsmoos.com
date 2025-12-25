
// B"H
/**
 * building.js - The Chochmah of architecture and spatial refinement.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import BuildingGenerator from '../../../dvarim/structure/buildingGenerator.js';

export default {
    getActiveItem() {
        if (this._tempHeldItem) return this._tempHeldItem; // B"H: Prioritize Editor-Grabbed items
        
        if (!this.inventory || !this.inventory.equipment) return null;
        const ref = this.inventory.equipment.rightHand;
        if (!ref) return null;
        
        const array = ref.sourceType === 'action' ? this.inventory.actionSlots : this.inventory.slots;
        return array ? array[ref.index] : null;
    },

    updateHandState() {
        const item = this.getActiveItem();
        
        const currentId = item ? (item.id || item.className) : "empty";
        if (this.lastItemId !== currentId) {
            this.lastItemId = currentId;
            this.removeActiveObject(); 
            this._isGeneratingGhost = false; 
        }

        if (!this.activeRay) return;

        if (item && (item.isBuildable || item.isPainter)) {
            if (!this.activeObject && !this._isGeneratingGhost) {
                this.placeBlockOnRay();
            }
        } else {
            this.removeActiveObject();
        }
    },

    async placeBlockOnRay() {
        if (this._isGeneratingGhost || !this.activeRay) return;
        this._isGeneratingGhost = true;

        try {
            const item = this.getActiveItem();
            if (!item) return;

            let mesh = null;
            const golem = item.golem || { guf: { BoxGeometry: [1,1,1] }, toyr: { MeshLambertMaterial: { color: "white" } } };

            if (item.isProceduralBuilding) {
                mesh = BuildingGenerator.generate('custom', item.specs || {});
            } else {
                mesh = await this.olam.generateThreeJsMesh(golem);
            }

            if (mesh) {
                mesh.traverse(c => {
                    if (c.isMesh && c.material) {
                        const mats = Array.isArray(c.material) ? c.material : [c.material];
                        mats.forEach(m => {
                            m.transparent = true;
                            m.opacity = 0.5;
                            m.depthWrite = false;
                        });
                    }
                });
                mesh.userData.isGhost = true;
                mesh.userData.itemData = item;
                mesh.awtsmoosGolem = golem;
                
                this.activeObject = { mesh };
                this.activeObject.mesh.position.z = this.distanceFromRay;
                this.activeRay.group.add(this.activeObject.mesh);
                this.alignObject();
            }
        } catch(e) { console.error("B\"H ghost generation error", e); }
        finally { this._isGeneratingGhost = false; }
    },

    async placeObject() {
        if (!this.activeObject || !this.activeObject.mesh) return;

        const item = this.getActiveItem();
        if (!item) return;

        const mesh = this.activeObject.mesh;
        mesh.updateMatrixWorld(true);
        const worldPos = new THREE.Vector3();
        const worldQuat = new THREE.Quaternion();
        const worldScale = new THREE.Vector3();
        mesh.matrixWorld.decompose(worldPos, worldQuat, worldScale);

        // Deduct if from inventory
        if (!this._tempHeldItem) {
            this.inventory.consumeItem(item, 1);
        } else {
            this._tempHeldItem = null; // Clear held state
        }

        const type = item.className || 'Domem';
        await this.olam.addObject(type, {
            position: worldPos,
            rotation: new THREE.Euler().setFromQuaternion(worldQuat),
            scale: worldScale,
            golem: mesh.awtsmoosGolem,
            itemData: item,
            isSolid: true,
            interactable: true
        });

        this.spawnHebrewParticles(worldPos);
        this.removeActiveObject();
        this.removeRay();
    },

    alignObject() {
        if (!this.activeObject) return;
        const q = new THREE.Quaternion();
        if (this.olam.ayin.isFPS) {
            const camEuler = new THREE.Euler().setFromQuaternion(this.olam.ayin.camera.quaternion, 'YXZ');
            q.setFromEuler(new THREE.Euler(camEuler.x, 0, 0));
        }
        const userRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.placementRotation || 0);
        this.activeObject.mesh.quaternion.copy(q.multiply(userRot));
    },

    removeActiveObject() {
        if (this.activeObject && this.activeObject.mesh) {
            this.activeObject.mesh.removeFromParent();
            this.activeObject = null;
        }
    }
};
        