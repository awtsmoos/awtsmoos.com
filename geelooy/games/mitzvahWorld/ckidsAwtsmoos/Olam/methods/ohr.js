
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
        const skyGlow = new THREE.HemisphereLight(0x88ccee, 0x443322, 1.2);
        this.scene.add(skyGlow);

        // 2. THE DIRECTED WILL (Sun - Ratzon)
        const theSun = new THREE.DirectionalLight(0xfffae6, 1.8);
        theSun.position.set(200, 400, 150); 
        theSun.castShadow = true;
        theSun.shadow.mapSize.width = 2048;
        theSun.shadow.mapSize.height = 2048;
        this.scene.add(theSun);

        // 3. THE LIGHT OF DA'AS (Diagnostic Origin Point)
        // A glowing orb at 0,0,0 to prove exact coordinates of manifestation
        const markerGeo = new THREE.SphereGeometry(2, 8, 8);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        const originMarker = new THREE.Mesh(markerGeo, markerMat);
        originMarker.position.set(0, 5, 0);
        this.scene.add(originMarker);
        
        // B"H: silent

    }
}
