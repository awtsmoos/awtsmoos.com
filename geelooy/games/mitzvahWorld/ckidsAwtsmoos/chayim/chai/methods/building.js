/**
 * B"H
 * @file building.js
 * Logic for placing and collecting items.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
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
        const currentId = item ? item.id : "empty";
        if (this.lastItemId !== currentId) {
            this.lastItemId = currentId;
            this.removeActiveObject(); 
        }

        if (!this.activeRay) return;

        if (item && item.isBuildable) {
            if (!this.activeObject) {
                this.placeBlockOnRay();
            }
        } else {
            this.removeActiveObject();
        }
    },

    async shoot() {
        if (!this.activeRay) return;
        const item = this.getActiveItem();

        if (item && item.isBuildable) {
            if (!this.activeObject) {
                await this.placeBlockOnRay();
            } else {
                await this.placeObject();
            }
        } else if (item && item.className === 'Tool') {
            if (this.activeObject) this.removeActiveObject();
            await this.collectObject();
        } else {
            if (this.activeObject) this.removeActiveObject();
        }
    },

    async collectObject() {
        const origin = this.getRayStart();
        const direction = this.getRayDirection();
        const ray = new THREE.Ray(origin, direction);
        
        const hit = this.olam.worldOctree.rayIntersect(ray);
        if (!hit || hit.distance > 15) return false;

        const physicsObject = hit.object;
        let visualObject = physicsObject;

        if (physicsObject.userData && physicsObject.userData.visualReference) {
            visualObject = physicsObject.userData.visualReference;
        }

        let tempObj = visualObject;
        while(tempObj && tempObj !== this.olam.nivrayimGroup) {
            if(tempObj.userData && (tempObj.userData.itemData || tempObj.userData.isSolid)) {
                visualObject = tempObj; 
                break;
            }
            tempObj = tempObj.parent;
        }

        if (visualObject.userData?.itemData?.id === "world_brick") {
            return false;
        }

        let itemData;
        
        if (visualObject.nivraAwtsmoos && typeof visualObject.nivraAwtsmoos.serialize === 'function') {
             const freshData = visualObject.nivraAwtsmoos.serialize();
             if (freshData.itemData) {
                 itemData = freshData.itemData;
             } else {
                 itemData = (visualObject.userData && visualObject.userData.itemData) ? visualObject.userData.itemData : {};
             }
        } else {
             itemData = (visualObject.userData && visualObject.userData.itemData) ? visualObject.userData.itemData : {
                id: "recovered_block", 
                className: "Brick",
                name: "Recovered Block",
                quantity: 1
            };
        }

        this.spawnHebrewParticles(visualObject.position); 
        this.inventory.addItem(itemData, 1);
        
        this.olam.worldOctree.removeMesh(physicsObject); 

        if (visualObject.nivraAwtsmoos) {
            this.olam.sealayk(visualObject.nivraAwtsmoos);
        } else {
            visualObject.removeFromParent();
        }
        
        this.playSound("awtsmoos://dingSound", { volume: 0.5 });
        return true;
    },

    async placeBlockOnRay() {
        if (this._isGeneratingGhost) return; 
        if (!this.activeRay || !this.activeRay.group) return;

        this._isGeneratingGhost = true;

        try {
            this.activeRay.group.clear();
            this.activeRay.group.add(this.activeRay.visual);
            this.removeActiveObject();

            const item = this.getActiveItem();
            if (!item || !item.isBuildable) return;

            let blockDefinition;
            let itemData = null;
            let mesh = null;

            if (item.className === "CustomNpc") {
                let modelPath = item.customData?.modelPath;
                
                // B"H: Verify model exists in current world components.
                // If not, fallback to the player's current path or a safe default.
                const componentExists = modelPath && this.olam.getComponent(modelPath);
                
                if (!componentExists) {
                    if (this.olam.chossid && this.olam.chossid.path) {
                        modelPath = this.olam.chossid.path;
                    } else {
                        modelPath = "awtsmoos://awduhm";
                    }
                }

                let gltf = await this.olam.boyrayNivra({ 
                    path: modelPath, 
                    isSolid: false,
                    name: "ghost_npc"
                });
                
                if (gltf && gltf.scene) {
                    mesh = gltf.scene;
                    
                    // B"H: Sync ghost appearance with player garments
                    const player = this.olam.chossid;
                    if (player && player.garments && player.path === modelPath) {
                        mesh.traverse(child => {
                            // Find corresponding garment on player
                            const playerGarment = Object.values(player.garments).find(g => g.name === child.name);
                            if (playerGarment) {
                                child.visible = playerGarment.visible;
                            } else if (player.defaultGarments && player.defaultGarments[child.name]) {
                                // If it's a known garment type but not in the player's active list (hidden), hide it
                                child.visible = false;
                            }
                        });
                    }

                    if (gltf.animations && gltf.animations.length) {
                        const mixer = new THREE.AnimationMixer(mesh);
                        const clip = THREE.AnimationClip.findByName(gltf.animations, "falling") || gltf.animations[0];
                        if(clip) {
                            const action = mixer.clipAction(clip);
                            action.play();
                            mixer.setTime(0);
                            mesh.userData.onUpdate = (dt) => mixer.update(dt);
                        }
                    }
                }
                blockDefinition = {}; 
                itemData = { ...item };

            } else {
                try {
                    const fileName = item.className.toLowerCase() + ".js"; 
                    // B"H: Fixed import path to correctly reach dvarim folder
                    const itemModule = await import(`../../../dvarim/${fileName}`);
                    const ItemClass = itemModule.default;
                    const tempItem = new ItemClass(item);
                    blockDefinition = tempItem.originalOptions.golem;
                    itemData = { ...item };
                    delete itemData.golem; 
                } catch (e) { console.error("Could not load item module", e); }
                
                if (!blockDefinition) {
                    blockDefinition = {
                        guf: { BoxGeometry: [1, 1, 1] },
                        toyr: { MeshLambertMaterial: { color: "#a0522d" } }
                    };
                }
                mesh = await this.olam.generateThreeJsMesh(blockDefinition);
            }

            if (!mesh) return;
            
            const makeGhost = (mat) => {
                if(mat) {
                    mat.transparent = true;
                    mat.opacity = 0.6;
                    mat.depthWrite = false;
                }
            };

            mesh.traverse(c => {
                if (c.isMesh) {
                    if (Array.isArray(c.material)) c.material.forEach(makeGhost);
                    else makeGhost(c.material);
                }
            });

            mesh.awtsmoosGolem = blockDefinition;
            if (itemData) mesh.userData.itemData = itemData;

            this.activeObject = { mesh };
            if(isNaN(this.distanceFromRay)) this.distanceFromRay = 5;
            this.activeObject.mesh.position.z = this.distanceFromRay;
            
            if(this.activeRay && this.activeRay.group) {
                this.activeRay.group.add(this.activeObject.mesh);
                this.alignObject();
            }

        } finally {
            this._isGeneratingGhost = false;
        }
    },

    async placeObject() {
        if (!this.activeObject || !this.activeObject.mesh) return;
        const activeItem = this.getActiveItem(); 
        if (!activeItem || !activeItem.isBuildable) return;

        const itemData = activeItem; 
        
        this.activeObject.mesh.updateMatrixWorld(true);
        const worldPosition = new THREE.Vector3();
        const worldQuaternion = new THREE.Quaternion();
        const worldScale = new THREE.Vector3();
        this.activeObject.mesh.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);
        const worldRotation = new THREE.Euler().setFromQuaternion(worldQuaternion);

        this.inventory.consumeItem(activeItem, 1);

        if (activeItem.className === "CustomNpc") {
            const currentPlayer = this.olam.chossid ? this.olam.chossid.name : "player";
            if(itemData.customData && !itemData.customData.ownerId) {
                itemData.customData.ownerId = currentPlayer;
            }

            await this.olam.loadNivrayim({
                CustomNpc: [{
                    ...itemData, 
                    position: worldPosition,
                    rotation: worldRotation,
                    isSolid: false 
                }]
            });
        } else {
            const type = itemData.className || 'Domem';
            await this.olam.addObject(type, {
                position: worldPosition,
                scale: worldScale,
                rotation: worldRotation,
                golem: this.activeObject.mesh.awtsmoosGolem, 
                itemData, 
                ...(itemData.dimensions ? { dimensions: itemData.dimensions } : {}),
                isSolid: true,
                interactable: true,
                name: "BH_permanent_block_" + Date.now()
            });
        }
        
        this.spawnHebrewParticles(worldPosition);

        if (!this.getActiveItem()) {
            this.removeRay();
        } else {
            this.removeActiveObject(); 
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

        const userRotQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.placementRotation);
        finalQuaternion.multiply(userRotQuat);
        this.activeObject.mesh.quaternion.copy(finalQuaternion);
    },

    removeActiveObject() {
        if (this.activeObject && this.activeObject.mesh) {
            if (this.activeObject.mesh.parent) {
                this.activeObject.mesh.removeFromParent();
            }
            this.olam.scene.remove(this.activeObject.mesh);
            this.activeObject = null;
        }
    },
    
    removeObject() {
        if(this.activeObject) {
            this.activeRay.group.remove(this.activeObject.mesh);
        }
    },

    rotatePreview() {
        this.placementRotation += Math.PI / 2;
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