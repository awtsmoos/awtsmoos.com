// B"H
/**
 * method for setting up inital proper lighting in the scene.
 * "Vivid Intense GI" Edition.
 * Now dynamically updates intensity based on the world's spiritual state.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class {
    ohr()/*light*/{
        if (!this.lights) {
            this.lights = new THREE.Group();
            this.enlightened = true;
            this.scene.add(this.lights);
        }
        
        // B"H: Volumetric intensity based on completed shlichuseem
        const sparks = this.completedShlichuseem ? this.completedShlichuseem.length : 0;
        const kedushahBoost = Math.min(2.0, sparks * 0.2); 

        // 1. HEMISPHERE LIGHT (GI Fake)
        if (!this.hemiLight) {
            this.hemiLight = new THREE.HemisphereLight(0xddeeff, 0x332222, 1.2); 
            this.hemiLight.position.set(0, 50, 0);
            this.lights.add(this.hemiLight);
        }
        this.hemiLight.intensity = 1.2 + (kedushahBoost * 0.5);

        // 2. DIRECTIONAL LIGHT (The Sun)
        if (!this.keyLight) {
            this.keyLight = new THREE.DirectionalLight(0xfff5e1, 2.5);
            this.keyLight.position.set(50, 100, 30);
            this.keyLight.castShadow = true;
            this.keyLight.shadow.mapSize.set(2048, 2048);
            this.keyLight.shadow.bias = -0.0001;
            const d = 100;
            this.keyLight.shadow.camera.left = -d;
            this.keyLight.shadow.camera.right = d;
            this.keyLight.shadow.camera.top = d;
            this.keyLight.shadow.camera.bottom = -d;
            this.lights.add(this.keyLight);
        }
        this.keyLight.intensity = 2.5 + kedushahBoost;
        
        // 3. AMBIENT LIGHT
        if (!this.ambientLight) {
            this.ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            this.lights.add(this.ambientLight);
        }
        this.ambientLight.intensity = 0.6 + (kedushahBoost * 0.2);

        // 4. RIM LIGHT (Dramatic Edge)
        if (!this.rimLight) {
            this.rimLight = new THREE.SpotLight(0xaaccff, 2.0);
            this.rimLight.position.set(-20, 50, -20);
            this.rimLight.penumbra = 1;
            this.lights.add(this.rimLight);
        }
        this.rimLight.intensity = 2.0 + (kedushahBoost * 0.8);

        // Tone Mapping for "Vivid" look
        if (this.renderer) {
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.2 + (kedushahBoost * 0.1);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
    }
}