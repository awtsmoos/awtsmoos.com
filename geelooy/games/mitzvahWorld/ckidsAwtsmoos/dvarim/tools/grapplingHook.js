
//B"H
import Tool from "../tool.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class GrapplingHook extends Tool {
    async shoot() {
        const ray = new THREE.Ray(this.olam.player.getRayStart(), this.olam.player.getRayDirection());
        const hit = this.olam.worldOctree.rayIntersect(ray);
        
        if(hit && hit.distance < 40) {
            // Visual Line (Simple)
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: "HOOKED!", color: "lime" });
            
            // Pull Player
            const pullDir = hit.position.clone().sub(this.olam.player.mesh.position).normalize();
            this.olam.player.velocity.add(pullDir.multiplyScalar(25));
            this.olam.player.velocity.y += 5; // Little hop
        }
    }
}
