
//B"H
import Tool from "../tool.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class GrapplingHook extends Tool {
    constructor(op, olam) { super(op); this.olam = olam; }
    async shoot() {
        const player = this.olam.player || this.olam.chossid;
        if (!player) return;
        const ray = new THREE.Ray(player.getRayStart(), player.getRayDirection());
        const hit = this.olam.worldOctree.rayIntersect(ray);
        
        if(hit && hit.distance < 40) {
            // Visual Line (Simple)
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: "HOOKED!", color: "lime" });
            
            // Pull Player
            const pullDir = hit.position.clone().sub(player.mesh.position).normalize();
            player.velocity.add(pullDir.multiplyScalar(25));
            player.velocity.y += 5; // Little hop
        }
    }
}
