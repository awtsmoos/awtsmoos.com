// B"H
/**
 * ohr.js - Manifesting the light within the Olam.
 * Features Idempotency Guard to prevent light accumulation.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class {
    ohr()/*light*/{
        // B"H: Idempotency Guard - A soul is enlightened once, the light persists.
        if (this.enlightened) return;
        
        console.group("B\"H - [Ohr] Initializing Debug Lighting");
        var lights = new THREE.Group();
        this.lights = lights;
        this.enlightened = true;
    
        // 1. Basic Ambient Light - Reduced intensity for balanced illumination
        console.log("B\"H - [Ohr] Adding Ambient Light");
        var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        this.ohros.push(ambientLight);
    
        // 2. Simple Directional Light (Sun) - No Shadows for stability
        console.log("B\"H - [Ohr] Adding Simple Sun Light");
        var keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
        keyLight.position.set(50, 100, 50);
        this.lights.add(keyLight);
        this.ohros.push(keyLight);
    
        this.scene.add(this.lights);
        console.log("B\"H - [Ohr] Lighting Setup Complete");
        console.groupEnd();
    }
}
