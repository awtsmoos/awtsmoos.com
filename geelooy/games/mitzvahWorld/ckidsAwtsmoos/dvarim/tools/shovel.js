//B"H
import Tool from "../tool.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import GeometryModifier from "../../Olam/methods/geometryModifier.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class Shovel extends Tool {
    constructor(op, olam) { super(op); this.radius = 2.0; this.olam = olam; }
    
    async shoot() {
        if (!this.modifier) this.modifier = new GeometryModifier(this.olam);
        const player = this.olam.player || this.olam.chossid;
        if (!player) return;
        const origin = player.getRayStart(), dir = player.getRayDirection();
        const ray = new THREE.Raycaster(origin, dir);
        const hits = ray.intersectObjects(this.olam.scene.children, true);
        const hit = hits.find(i => i.object.userData.isTerrain);
        
        if (hit && hit.distance < 10) {
            this.modifier.modify(hit.object, hit.point, this.radius, 1.0);
            if(typeof player.spawnHebrewParticles === 'function') {
                player.spawnHebrewParticles(hit.point, 5);
            }
            
            // B"H: Strike Water Logic
            if (hit.point.y < -5) {
                // Ground water level
                if (Math.random() < 0.2) {
                     this.olam.ayshPeula("ui event", "effectsOverlay", { text: "STRUCK WATER!", color: "cyan" });
                     if (!this.olam.fluidSystem) {
                         const m = await import('../nature/fluidSystem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1');
                         this.olam.fluidSystem = new m.default(this.olam);
                     }
                     this.olam.fluidSystem.addWater(hit.point.clone().add(new THREE.Vector3(0,1,0)), 20.0);
                }
            }
        }
    }
}
