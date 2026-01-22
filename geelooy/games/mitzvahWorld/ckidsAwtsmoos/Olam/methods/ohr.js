// B"H
/**
 * ohr.js - Manifesting the Divine Light (Ohr) within the Olam.
 * 
 * Light is not merely a technical calculation; it is the Speech of the Awtsmoos
 * revealing the hidden beauty of the Vessels (Kailim). 
 * 
 * This rig implements:
 * 1. The Great Sun (DirectionalLight) - The source of Hashgacha.
 * 2. The Atmospheric Glow (AmbientLight) - The Ohr Sovev (Surrounding Light).
 * 3. The Ground Reflection (HemisphereLight) - The sparks returning from below.
 * 4. Sacred Spotlights - Highlighting interactable souls.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class {
    /**
     * ohr - The act of lighting the Menorah of the world.
     */
    ohr() {
        if (this.enlightened) return;
        
        const lights = new THREE.Group();
        this.lights = lights;
        this.ohros = []; // Master list for updates
        this.enlightened = true;

        /**
         * 1. THE OHR SOVEV (Ambient Light)
         * Represents the Infinite Light that surrounds all worlds equally.
         * Provides a base level of existence so no vessel is truly in darkness.
         */
        const ambientLight = new THREE.AmbientLight(0xffe8c3, 0.4);
        this.scene.add(ambientLight);
        this.ohros.push(ambientLight);

        /**
         * 2. THE KAV (The Great Sun / Directional Light)
         * Represents the focused beam of Light that enters the Tzimtzum.
         * It casts the shadows of consequence and defines the geometry of life.
         */
        const sunLight = new THREE.DirectionalLight(0xfff5e1, 1.8);
        sunLight.position.set(100, 200, 100);
        
        // Shadow configuration for Epic Depth
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.set(2048, 2048); // High-fidelity shadows
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 1000;
        
        // Frustum must cover the visible world bubble
        const d = 150;
        sunLight.shadow.camera.left = -d;
        sunLight.shadow.camera.right = d;
        sunLight.shadow.camera.top = d;
        sunLight.shadow.camera.bottom = -d;
        sunLight.shadow.bias = -0.0005;
        
        this.scene.add(sunLight);
        this.ohros.push(sunLight);
        this.mainSun = sunLight; // Track for Day/Night cycle

        /**
         * 3. THE RETURNED LIGHT (Hemisphere Light)
         * Blends the sky light with ground bounce, ensuring realistic shadows.
         */
        const hemiLight = new THREE.HemisphereLight(0xfff5e1, 0x080820, 0.6);
        this.scene.add(hemiLight);
        this.ohros.push(hemiLight);

        /**
         * 4. NPC POTENTIALITY (Spotlight Pool)
         * We create a pool of spotlights that follow the soul's focus.
         */
        this.mitzvahSpotlights = new THREE.Group();
        this.scene.add(this.mitzvahSpotlights);

        if (this.renderer) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.toneMapping = THREE.ReinhardToneMapping;
            this.renderer.toneMappingExposure = 1.2;
        }

        console.log("B\"H - The Olam is Enlightened.");
    }

    /**
     * updateNPCSpotlight - Highlights the soul currently in conversation.
     * @param {Object} npc The Medabeir entity.
     */
    activateSoulLight(npc) {
        if (!this.convoLight) {
            this.convoLight = new THREE.SpotLight(0xffffff, 50, 15, Math.PI / 6, 0.5, 2);
            this.convoLight.castShadow = true;
            this.scene.add(this.convoLight);
        }
        
        const pos = npc.mesh.position;
        this.convoLight.position.set(pos.x, pos.y + 10, pos.z);
        this.convoLight.target = npc.mesh;
        this.convoLight.visible = true;
    }

    deactivateSoulLight() {
        if (this.convoLight) this.convoLight.visible = false;
    }
}
