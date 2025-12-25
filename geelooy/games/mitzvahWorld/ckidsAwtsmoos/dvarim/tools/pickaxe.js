//B"H
/**
 * Pickaxe - Tools for revealing the hidden sparks within the earth.
 */
import Tool from "../tool.js";
import * as THREE from '/games/scripts/build/three.module.js';
import HoleManager from "../../Olam/math/HoleManager.js";

export default class Pickaxe extends Tool {
    async shoot() {
        const origin = this.olam.player.getRayStart();
        const dir = this.olam.player.getRayDirection();
        const ray = new THREE.Raycaster(origin, dir);
        
        const hits = ray.intersectObjects(this.olam.scene.children, true);
        const hit = hits.find(h => h.object.userData.isTerrain || h.object.userData.isSolid);
        
        if (hit && hit.distance < 10) {
            // Visual Effect
            this.olam.player.spawnHebrewParticles(hit.point, 15);
            
            // Add a Hole to the world
            HoleManager.addHole(hit.point, 1.5, this.olam);
            
            // Drop Resource
            if (Math.random() > 0.6) {
                this.olam.player.inventory.addItem({
                    id: "stone_spark",
                    className: "Brick",
                    name: "Stone Spark",
                    description: "Refined matter from the deep.",
                    sellValue: 10
                });
            }
            
            this.olam.playSound("awtsmoos://dingSound", { volume: 0.5 });
        }
    }
}