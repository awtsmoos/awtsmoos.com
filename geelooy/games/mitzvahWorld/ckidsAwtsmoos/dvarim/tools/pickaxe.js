//B"H
/**
 * Pickaxe - Tools for revealing the hidden sparks within the earth.
 */
import Tool from "../tool.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import HoleManager from "../../Olam/math/HoleManager.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class Pickaxe extends Tool {
    async shoot() {
        const player = this.olam.player || this.olam.chossid;
        const origin = player.getRayStart();
        const dir = player.getRayDirection();
        const ray = new THREE.Raycaster(origin, dir);
        
        const hits = ray.intersectObjects(this.olam.scene.children, true);
        const hit = hits.find(h => h.object.userData.isTerrain || h.object.userData.isSolid);
        
        if (hit && hit.distance < 10) {
            // Visual Effect
            if (typeof player.spawnHebrewParticles === 'function') {
                player.spawnHebrewParticles(hit.point, 15);
            }
            
            // Add a Hole to the world
            if (HoleManager && typeof HoleManager.addHole === 'function') {
                HoleManager.addHole(hit.point, 1.5, this.olam);
            }
            
            // Drop Resource
            if (Math.random() > 0.6) {
                if (player.inventory) {
                    player.inventory.addItem({
                        id: "stone_spark",
                        className: "Brick",
                        name: "Stone Spark",
                        description: "Refined matter from the deep.",
                        sellValue: 12
                    });
                }
            }
            
            if (typeof this.olam.playSound === 'function') {
                this.olam.playSound("awtsmoos://dingSound", { volume: 0.5 });
            }
        }
    }
}