/**
 * B"H
 * Procedural Clouds
 */
import Domem from "../../chayim/domem.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class ProceduralCloud extends Domem {
    type = "proceduralCloud";
    
    constructor(op, olam) {
        super(op, olam);
        
        this.on("heescheel", (olam) => {
            const geometry = new THREE.PlaneGeometry(500, 500);
            
            // B"H: SAFE MODE - Standard Material
            const material = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0.3,
                depthWrite: false,
                color: 0xffffff,
                side: THREE.DoubleSide
            });
            
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.rotation.x = -Math.PI / 2;
            this.mesh.position.y = 50; 
            olam.nivrayimGroup.add(this.mesh);
        });
    }
}