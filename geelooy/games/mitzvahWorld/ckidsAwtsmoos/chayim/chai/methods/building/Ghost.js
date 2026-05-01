
/**
 * B"H
 * @module Ghost
 * @description
 * THE POTENTIAL FORM (TZELEM)
 * 
 * "And G-d created man in His image (Tzelem)..."
 * The Ghost is the non-physical precursor to a building block. 
 * It is a projection of intent into the void, showing where 
 * a spark will soon be anchored.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    async placeBlockOnRay() {
        if (this._isGeneratingGhost) return; 
        if (!this.activeRay || !this.activeRay.group) return;

        console.log('B"H - 🌌 [TZELEM]: Generating potential form for placement.');
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
                    let modelPath = item.customData?.modelPath || "awtsmoos://awduhm";
                    let gltf = await this.olam.boyrayNivra({ path: modelPath, isSolid: false, name: "ghost_npc" });
                    if (gltf) mesh = gltf.scene || gltf;
                    blockDefinition = {}; 
                    itemData = { ...item };
                } else if (item.className === "ProceduralTree") {
                    const treeModule = await import('../../../../dvarim/nature/proceduralTree.js');
                    const TreeClass = treeModule.default;
                    const tempTree = new TreeClass(item, this.olam);
                    tempTree.generateGeometry();
                    await tempTree.createMeshes(); 
                    mesh = tempTree.treeGroup;
                    blockDefinition = {}; 
                    itemData = { ...item };
                } else if (item.isPainter) {
                    let modelPath = item.natureType?.includes('flower') ? "awtsmoos://flowerBlue" : "awtsmoos://grassModel"; 
                    const type = item.natureType || 'grass';
                    
                    if (type.includes('rock') || type.includes('grass')) {
                        const geomMod = await import('../../../../dvarim/nature/procedural/geometryGenerator.js');
                        const geom = geomMod.default.get(type);
                        mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }));
                    } else {
                        let result = await this.olam.boyrayNivra({ path: modelPath, isSolid: false, name: "ghost_nature" });
                        if (result) mesh = result.scene || result;
                    }
                    itemData = { ...item };
                } else {
                    try {
                        const fileName = item.className.toLowerCase() + ".js"; 
                        const itemModule = await import(`../../../../dvarim/${fileName}`);
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
            } catch(e) { console.warn("B\"H: Error loading ghost model for", item.name, e); }

            if (!mesh) {
                mesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: 0xFF00FF, wireframe: true, transparent: true, opacity: 0.5 }));
                itemData = { ...item };
            }
            
            const makeGhost = (mat) => {
                if(mat) {
                    mat.transparent = true;
                    if(item.isPainter) {
                        mat.opacity = this.isPaintingMode ? 0.8 : 0.3;
                        mat.color.setHex(this.isPaintingMode ? 0x00ff00 : 0xff0000);
                        mat.wireframe = !this.isPaintingMode;
                    } else { mat.opacity = 0.6; }
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
            this.activeObject.mesh.position.z = isNaN(this.distanceFromRay) ? 5 : this.distanceFromRay;
            
            if(this.activeRay && this.activeRay.group) {
                this.activeRay.group.add(this.activeObject.mesh);
                this.alignObject();
            }

        } catch(e) { console.error("B\"H Error in placeBlockOnRay:", e);
        } finally { this._isGeneratingGhost = false; }
    }
};
