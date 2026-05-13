
/**
 * B"H
 * @module LuminaryManifestor
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class LuminaryManifestor {
    /**
     * @method ohr
     * @description Unleashes the holy luminaries onto the scene void.
     */
    ohr() {
        if (!this.scene) return;

        this.enlightened = true;

        // B"H: THE TIKKUN OF VISION
        // Setting background to Heavenly Blue! 
        // Previously this matched the green of the earth completely preventing 
        // depth perception as if it were a seamless chroma key screen.
        this.scene.background = new THREE.Color(0x87CEEB); 
        this.scene.fog = new THREE.Fog(0x87CEEB, 200, 3000); 

        // 1. THE EMBRACING WISDOM (Hemisphere - Chochmah)
        // Illuminates evenly avoiding harsh under-shadowing clipping
        const ambient = new THREE.AmbientLight(0xffffff, 0.75);
        this.scene.add(ambient);

        const skyGlow = new THREE.HemisphereLight(0xaaddff, 0x665544, 1.6);
        this.scene.add(skyGlow);

        // 2. THE DIRECTED WILL (Sun - Ratzon)
        const theSun = new THREE.DirectionalLight(0xfffae6, 2.2);
        theSun.position.set(200, 400, 150); 
        theSun.castShadow = true;
        theSun.shadow.mapSize.width = 2048;
        theSun.shadow.mapSize.height = 2048;
        this.scene.add(theSun);

        // B"H: The Light of Da'as is now internal, no longer needing a physical marker.

        
        // B"H: silent

    }
}
