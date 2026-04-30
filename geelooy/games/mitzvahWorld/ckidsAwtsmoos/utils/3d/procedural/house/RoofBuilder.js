
// B"H
import * as THREE from '/games/scripts/build/three.module.js';

export default class RoofBuilder {
    static build(blueprint) {
        try {
            const w = blueprint.width;
            const h = blueprint.height;
            const d = blueprint.depth;
            
            // Ascension geometry calculated by building scale
            const roofHeight = Math.max(w, d) * 0.4;
            
            // Divine overhang to shield the walls
            const overhang = 1.0; 
            
            // The diagonal of a square base requires scaling by Sqrt(2)
            const circumRadius = (Math.max(w, d) / 2 + overhang) * Math.sqrt(2);
            
            // A 4-sided cone manifests as a classic pitched pyramid roof
            const roof = new THREE.ConeGeometry(circumRadius, roofHeight, 4);
            
            // Shift geometry so the flat edges align perpendicularly with X/Z coordinates
            roof.rotateY(Math.PI / 4);
            
            // Translate the mass so its base kisses the pinnacle of the walls
            roof.translate(0, h + (roofHeight / 2), 0);
            
            return [roof];
        } catch (e) {
            console.error("B\"H - ⚡ RoofBuilder's capstone shattered.", e);
            return [];
        }
    }
}
