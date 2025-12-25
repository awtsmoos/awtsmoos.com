//B"H
import Tool from "../tool.js";
export default class GrapplingHook extends Tool {
    async shoot() {
        const hit = this.olam.worldOctree.rayIntersect(new THREE.Ray(this.olam.player.getRayStart(), this.olam.player.getRayDirection()));
        if(hit) this.olam.player.velocity.add(hit.normal.multiplyScalar(-20));
    }
}