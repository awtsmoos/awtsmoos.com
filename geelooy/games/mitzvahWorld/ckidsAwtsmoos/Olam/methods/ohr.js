
/**
 * B"H
 * @module LuminaryManifestor
 * @description
 * 💡 CHAPTER 3: THE BIRTH OF RADIATION (OHR) 💡
 * 
 * Chapter 30: The Dawn.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class LuminaryManifestor {
    /**
     * @method ohr
     * @description Unleashes the holy luminaries onto the scene void.
     */
    ohr() {
        // Gaining focus on the void
        if (!this.scene) {
            console.error('B"H - 🌑 ERROR: LACKING SCENE CONTAINER. THE OHR DISAPPEARED INTO TOHU.');
            return;
        }

        this.enlightened = true;
        this.lights = new THREE.Group();
        this.lights.name = "Spiritual_Luminescence_Hierarchy";

        // 1. THE EMBRACING WISDOM (Hemisphere - Chochmah)
        // Eliminates the cold shadows of nothingness, filling every corner.
        const skyGlow = new THREE.HemisphereLight(
            0xffffff, // Pure light from the crown
            0x444444, // Earthy reflection from the dust of creation
            3.5       // HIGH INTENSITY for guaranteed first-frame visibility
        );
        this.scene.add(skyGlow);

        // 2. THE DIRECTED WILL (Sun - Ratzon)
        // Provides the shadow and shape necessary to define existence.
        const theSun = new THREE.DirectionalLight(0xfffaee, 1.3);
        theSun.position.set(100, 350, 100); // Angle of the morning sun
        
        // Shadow complexity delayed to ensure engine stability
        theSun.castShadow = false; 

        this.lights.add(theSun);
        this.scene.add(this.lights);
        
        this.ohros = [skyGlow, theSun];
        
        console.log('B"H - 🕯️ LUMINANCE CONFIRMED: The dark void has been entirely banished by 2 lamps.');
    }
}
