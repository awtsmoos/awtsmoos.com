//B"H
import Tool from "../tool.js";
import * as THREE from '/games/scripts/build/three.module.js';
import GeometryModifier from "../../Olam/methods/geometryModifier.js";

export default class Shovel extends Tool {
    constructor(op) { super(op); this.radius = 2.0; }
    async ready() { await super.ready(); this.modifier = new GeometryModifier(this.olam); }
    
    async shoot() {
        const origin = this.olam.player.getRayStart(), dir = this.olam.player.getRayDirection();
        const ray = new THREE.Raycaster(origin, dir);
        const hits = ray.intersectObjects(this.olam.scene.children, true);
        const hit = hits.find(i => i.object.userData.isTerrain);
        
        if (hit && hit.distance < 10) {
            this.modifier.modify(hit.object, hit.point, this.radius, 1.0);
            this.olam.player.spawnHebrewParticles(hit.point, 5);
            
            // B"H: Strike Water Logic
            if (hit.point.y < -5) {
                // Ground water level
                if (Math.random() < 0.2) {
                     this.olam.ayshPeula("ui event", "effectsOverlay", { text: "STRUCK WATER!", color: "cyan" });
                     if (!this.olam.fluidSystem) {
                         const m = await import('../nature/fluidSystem.js');
                         this.olam.fluidSystem = new m.default(this.olam);
                     }
                     this.olam.fluidSystem.addWater(hit.point.clone().add(new THREE.Vector3(0,1,0)), 20.0);
                }
            }
        }
    }
}
