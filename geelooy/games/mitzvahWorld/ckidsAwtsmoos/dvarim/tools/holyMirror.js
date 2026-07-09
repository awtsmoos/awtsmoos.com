//B"H
/**
 * Holy Mirror - Spawns a reflective surface to reflect the divine image.
 */
import Tool from "../tool.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class HolyMirror extends Tool {
    static itemName = "Mirror of the Soul";
    static description = "Spawns a reflective surface.";

    async shoot() {
        const ray = new THREE.Raycaster(this.olam.player.getRayStart(), this.olam.player.getRayDirection());
        const hit = this.olam.worldOctree.rayIntersect(ray.ray);
        
        if (hit && hit.distance < 10) {
            const mirrorGeo = new THREE.PlaneGeometry(3, 5);
            const mirrorMat = new THREE.MeshStandardMaterial({ 
                color: 0x888888,
                metalness: 1.0,
                roughness: 0.0,
                envMapIntensity: 1.0
            });
            
            const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
            mirror.position.copy(hit.point);
            mirror.lookAt(this.olam.player.mesh.position);
            mirror.position.y += 2.5;
            
            this.olam.scene.add(mirror);
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Mirror Manifested", color: "cyan" });
        }
    }
}