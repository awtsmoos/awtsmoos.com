
/**
 * B"H
 * @file building.js
 * Logic for placing, collecting, and painting items.
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
        
        // Initialize Nature System if needed
        if (item && item.isPainter && !this.olam.natureSystem) {
             // B"H FIX: Correct relative path to reach ckidsAwtsmoos root
             import('../../../dvarim/nature/natureSystem.js').then(m => {
                 this.olam.natureSystem = new m.default(this.olam);
                 // Pre-load ONLY common assets to avoid spamming errors
                 this.olam.natureSystem.initPool('grass', 10000, "awtsmoos://grassModel");
             }).catch(e => console.error("B\"H: Failed to load NatureSystem", e));
        }
        
        // Continuous Painting Logic
        if (this.olam.mouseDown && item && item.isPainter && this.activeRay) {
             const origin = this.getRayStart();
             const direction = this.getRayDirection();
             const ray = new THREE.Ray(origin, direction);
             const hit = this.olam.worldOctree.rayIntersect(ray);
             
             if (hit && hit.distance < 15 && this.olam.natureSystem) {
                 this.olam.natureSystem.paint(item.natureType, hit.position);
             }
        }

        const currentId = item ? item.id : "empty";
        if (this.lastItemId !== currentId) {
            this.lastItemId = currentId;
            this.removeActiveObject(); 
        }

        if (!this.activeRay) return;

        // B"H: Show ghost for both Buildable items AND Painters (Nature Tools)
        if (item && (item.isBuildable || item.isPainter)) {
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
        
        if (item && item.isPainter) {
            // B"H: Optional - Allow single click paint on shoot
            const origin = this.getRayStart();
            const direction = this.getRayDirection();
            const ray = new THREE.Ray(origin, direction);
            const hit = this.olam.worldOctree.rayIntersect(ray);
            if (hit && hit.distance < 15 && this.olam.natureSystem) {
                this.olam.natureSystem.paint(item.natureType, hit.position);
            }
            return;
        }

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
            if (!item || (!item.isBuildable && !item.isPainter)) return;

            let blockDefinition;
            let itemData = null;
            let mesh = null;

            try {
                if (item.className === "CustomNpc") {
                    let modelPath = item.customData?.modelPath;
                    const componentExists = modelPath && this.olam.getComponent(modelPath);
                    if (!componentExists) modelPath = "awtsmoos://awduhm";
                    let gltf = await this.olam.boyrayNivra({ path: modelPath, isSolid: false, name: "ghost_npc" });
                    if (gltf) {
                         if(gltf.scene) mesh = gltf.scene;
                         else if(gltf.isObject3D) mesh = gltf;
                    }
                    blockDefinition = {}; 
                    itemData = { ...item };
                } else if (item.className === "ProceduralTree") {
                    // B"H FIX: Correct Import Path to new location
                    const treeModule = await import('../../../dvarim/nature/proceduralTree.js');
                    const TreeClass = treeModule.default;
                    const tempTree = new TreeClass(item, this.olam);
                    
                    // B"H FIX: Manually trigger generation for the ghost since heescheel isn't called
                    tempTree.generateGeometry();
                    await tempTree.createMeshes(); 
                    
                    mesh = tempTree.treeGroup;
                    blockDefinition = {}; 
                    itemData = { ...item };
                } else if (item.isPainter) {
                    // B"H: Ghost for Nature Tools (Painters)
                    let modelPath = "awtsmoos://grassModel"; // Default
                    const type = item.natureType || 'grass';
                    
                    if (type.includes('rock')) modelPath = "awtsmoos://rockModel1";
                    else if (type.includes('flower')) modelPath = "awtsmoos://flowerBlue";
                    
                    // Try to load model, handle failure gracefully
                    let result = null;
                    try {
                        result = await this.olam.boyrayNivra({ path: modelPath, isSolid: false, name: "ghost_nature" });
                    } catch(e) {
                        console.warn("B\"H: Failed to load ghost nature model", modelPath, e);
                    }

                    if (result && !result.userData?.error) {
                         if(result.scene) mesh = result.scene;
                         else if (result.isObject3D) mesh = result;

                         if(mesh) {
                             // B"H FIX: Scale flowers down too!
                             if(type === 'grass' || type.includes('flower')) {
                                 mesh.scale.multiplyScalar(0.1); 
                             } else {
                                 mesh.scale.multiplyScalar(0.8 + Math.random() * 0.4);
                             }
                             mesh.rotation.y = Math.random() * Math.PI * 2;
                         }
                    } else {
                        // B"H: Immediate Fallback if model loading fails
                        let geo;
                        if(type === 'grass') geo = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
                        else geo = new THREE.DodecahedronGeometry(0.3);
                        
                        mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }));
                    }
                    itemData = { ...item };
                } else {
                    try {
                        const fileName = item.className.toLowerCase() + ".js"; 
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
            } catch(e) {
                console.warn("B\"H: Error loading ghost model for", item.name, e);
            }

            // B"H: Ultimate Fallback if model loading failed completely
            if (!mesh) {
                console.warn("B\"H: Generating fallback box for", item.name);
                const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                const mat = new THREE.MeshBasicMaterial({ 
                    color: 0xFF00FF, 
                    wireframe: true, 
                    transparent: true, 
                    opacity: 0.5 
                });
                mesh = new THREE.Mesh(geo, mat);
                itemData = { ...item };
            }
            
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

        } catch(e) {
            console.error("B\"H Error in placeBlockOnRay:", e);
        } finally {
            this._isGeneratingGhost = false;
        }
    },

    async placeObject() {
        if (!this.activeObject || !this.activeObject.mesh) {
             this._isGeneratingGhost = false; 
             return;
        }

        const activeItem = this.getActiveItem(); 
        if (!activeItem || !activeItem.isBuildable) return; // Painters handled in updateHandState

        const itemData = activeItem; 
        
        if(this.activeObject && this.activeObject.mesh) {
             this.activeObject.mesh.updateMatrixWorld(true);
             const worldPosition = new THREE.Vector3();
             const worldQuaternion = new THREE.Quaternion();
             const worldScale = new THREE.Vector3();
             this.activeObject.mesh.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);
             const worldRotation = new THREE.Euler().setFromQuaternion(worldQuaternion);

             this.inventory.consumeItem(activeItem, 1);

             if (activeItem.className === "CustomNpc") {
                  await this.olam.loadNivrayim({
                     CustomNpc: [{ ...itemData, position: worldPosition, rotation: worldRotation, isSolid: false }]
                 });
             } else if (activeItem.className === "ProceduralTree") {
                 // Plant Tree
                 await this.olam.loadNivrayim({
                     ProceduralTree: [{ ...itemData, position: worldPosition, rotation: worldRotation, scale: worldScale, isSolid: true }]
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
                 this.placeBlockOnRay();
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
