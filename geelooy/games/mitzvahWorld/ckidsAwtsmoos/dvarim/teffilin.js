//B"H
/**
 * @file teffilin.js
 * The Crown of Splendor. Connects the heart and mind to the Infinite.
 * Reverted to stable tool logic, removing modular AI/Bone features for legacy compatibility.
 */
import Tool from "./tool.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class Teffilin extends Tool {
    static itemName = "Teffilin";
    static description = "Bind the mind and heart to the Awtsmoos. (Click on a soul to help them do a Mitzvah).";
    static icon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcng9IjUiIGZpbGw9IiMxMTEiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iMzUiIHk9IjM1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNNDAgNjAgTDQwIDQ1IEw1MCA2MCBMNjAgNDUgTDYwIDYwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC44Ii8+PHBhdGggZD0iTTI1IDUwIEwxMCA1MCBNNzUgNTAgTDkwIDUwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNiIvPjwvc3ZnPg==";
    
    constructor(op) {
        if (!op.golem) {
            op.golem = {
                guf: { BoxGeometry: [0.3, 0.3, 0.3] },
                toyr: { MeshStandardMaterial: { color: "black", roughness: 0.2 } }
            };
        }
        super(op);
        this.isTool = true;
    }

    /**
     * B"H
     * The act of clicking with the Teffilin.
     * It searches for a soul and attempts to elevate it.
     */
    async shoot() {
        if (!this.olam.player) return;

        const origin = this.olam.player.getRayStart();
        const dir = this.olam.player.getRayDirection();
        const ray = new THREE.Raycaster(origin, dir);
        
        // Find hits among all scene children
        const hits = ray.intersectObjects(this.olam.scene.children, true);
        
        let targetSoul = null;
        for (const hit of hits) {
            let obj = hit.object;
            while (obj) {
                // Look for a Medabeir (Speaker) entity
                if (obj.nivraAwtsmoos && (obj.nivraAwtsmoos.type === 'customNpc' || obj.nivraAwtsmoos.type === 'medabeir')) {
                    targetSoul = obj.nivraAwtsmoos;
                    break;
                }
                obj = obj.parent;
            }
            if (targetSoul) break;
        }

        if (targetSoul) {
            this.handleMivtza(targetSoul);
        } else {
            this.olam.ayshPeula("ui event", "effectsOverlay", { 
                text: "Aim at a Jewish Soul!", 
                color: "orange" 
            });
        }
    }

    /**
     * B"H
     * Stable logic to increment Mivtza progress via the standard collectItem API.
     */
    handleMivtza(npc) {
        if (npc.hasDoneTeffilinToday) {
            this.olam.ayshPeula("ui event", "effectsOverlay", { 
                text: "Already lit up today!", 
                color: "#4cc9f0" 
            });
            return;
        }

        // Visual Spark of Holiness
        if (this.olam.player.spawnHebrewParticles) {
            this.olam.player.spawnHebrewParticles(npc.mesh.position, 26);
        }

        // Global Feedback
        this.olam.ayshPeula("ui event", "effectsOverlay", { 
            text: "Mitzvah Accomplished!", 
            color: "#FFD700" 
        });
        this.olam.playSound("awtsmoos://dingSound");

        npc.hasDoneTeffilinToday = true;

        // Progress Mission logic
        if (this.olam.shlichusHandler) {
            const mivtza = this.olam.shlichusHandler.getShlichusByShaym("Mivtza Teffilin");
            if (mivtza && mivtza.state === 'ACTIVE') {
                mivtza.collectItem();
            }
        }

        // Emotional Reaction
        if (npc.lev) {
            npc.lev.react("GREET", 0.5);
        }
    }
}
