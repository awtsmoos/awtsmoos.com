/**
 * B"H
 * Axe Tool - For harvesting wood from procedural trees.
 * 
 * Chapter 18: The Axe of Bitul
 * "For the tree of the field is man's life..." (Devarim 20:19)
 * By pruning the excess, we reveal the inner essence.
 */
import Tool from "../tool.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class Axe extends Tool {
    constructor(op, olam) {
        super(op, olam);
        this.olam = olam;
        
        if (!op.golem) {
             this.golem = {
                 guf: { BoxGeometry: [0.1, 1.5, 0.1] }, // Handle
                 toyr: { MeshStandardMaterial: { color: "#4e342e" } },
                 parts: [
                     {
                         golem: { BoxGeometry: [0.6, 0.4, 0.1] }, // Head
                         toyr: { MeshStandardMaterial: { color: "#9e9e9e", metalness: 0.8, roughness: 0.2 } },
                         offset: { x: 0.2, y: 0.6, z: 0 }
                     }
                 ]
             };
        }
    }

    async shoot() {
        const player = this.olam.player || this.olam.chossid;
        if (!player) return;

        const ray = new THREE.Raycaster(player.getRayStart(), player.getRayDirection());
        const hits = ray.intersectObjects(this.olam.scene.children, true);
        
        // Find a tree
        const hit = hits.find(h => {
            let obj = h.object;
            while(obj) {
                if (obj.nivraAwtsmoos && obj.nivraAwtsmoos.type === 'ProceduralTree') return true;
                obj = obj.parent;
            }
            return false;
        });

        if (hit && hit.distance < 8) {
            let treeObj = hit.object;
            while(treeObj && (!treeObj.nivraAwtsmoos || treeObj.nivraAwtsmoos.type !== 'ProceduralTree')) {
                treeObj = treeObj.parent;
            }

            const tree = treeObj.nivraAwtsmoos;
            if (tree) {
                // Visual Effect
                if (player.spawnHebrewParticles) player.spawnHebrewParticles(hit.point, 10);
                this.olam.playSound("awtsmoos://dingSound", { pitch: 0.5 });

                // Tree Health (Simple)
                if (!tree.hp) tree.hp = 3;
                tree.hp--;

                if (tree.hp <= 0) {
                    this.olam.ayshPeula("ui event", "effectsOverlay", { text: "TREE FELLED!", color: "#8d6e63" });
                    
                    // Drop Wood
                    this.olam.addObject("Collectable", {
                        itemId: "wood_log",
                        itemName: "Cedar Log",
                        itemType: "resource",
                        amount: 3,
                        position: hit.point.clone().add({x:0, y:1, z:0}),
                        color: "#5d4037",
                        meshType: "box",
                        sellValue: 15
                    });

                    // Remove tree from world
                    this.olam.sealayk(tree);
                } else {
                    this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Chop...", color: "#a1887f" });
                }
            }
        }
    }
}
