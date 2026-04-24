
// B"H
/**
 * environment.js - Managing the Atmosphere of the Olam.
 * 
 * The environment is the "Space" created by the Tzimtzum.
 * It transitions through the 4 spiritual worlds based on the passage of time.
 * 
 * 1. Atzilut (Noon) - Brilliant, Infinite White/Gold.
 * 2. Beriah (Afternoon) - The vast blue of creation.
 * 3. Yetzirah (Dusk) - The formation of fire and amber.
 * 4. Asiyah (Night) - The deep靛 (indigo) of physical potential.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import WeatherEffects from './WeatherEffects.js';

export default class Environment {
    constructor({ scene, olam }) {
        this.scene = scene;
        this.olam = olam;
        this.gameTime = 12; // Start at Noon (Atzilut Peak)
        this.timeSpeed = 0.05; // The speed of the Cosmic Clock
        
        this.weatherType = 'CLEAR';
        this.weatherIntensity = 0;
        
        // 4 Worlds Color Palette
        this.atzilutColor = new THREE.Color(0xfffbe6); // Divine Gold/White
        this.beriahColor = new THREE.Color(0x88ccee);  // Celestial Blue
        this.yetzirahColor = new THREE.Color(0xffa500); // Amber Formation
        this.asiyahColor = new THREE.Color(0x050510);   // Deep Physical Indigo
        
        this.weatherEffects = new WeatherEffects(this.olam);
        this.initAtmosphericMesh();
    }

    /**
     * initAtmosphericMesh - Creates a physical "Sky Box" that can be manipulated by shaders.
     */
    initAtmosphericMesh() {
        const skyGeo = new THREE.SphereGeometry(2000, 32, 32);
        const skyMat = new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            color: this.atzilutColor
        });
        this.skyVessel = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(this.skyVessel);
    }

    /**
     * update - The constant pulse of the universe.
     */
    update(dt, playerPos) {
        // 1. Advance the Cosmic Clock
        this.gameTime = (this.gameTime + dt * this.timeSpeed) % 24;
        
        // 2. Determine Current Spiritual Quality
        const cycle = this.calculateSpiritualCycle();
        
        // 3. Manifest the Atmospheric Color
        this.manifestAtmosphere(cycle);

        // 4. Update the Sun Vessel (Hashgacha)
        if (this.olam.mainSun) {
            this.updateSunPosition();
        }

        // 5. Weather Phenomena
        this.weatherEffects.update(dt, this.weatherType, this.weatherIntensity, this.gameTime);
    }

    calculateSpiritualCycle() {
        const time = this.gameTime;
        // 6-10: Sunrise (Asiyah -> Beriah)
        // 10-14: Noon (Atzilut)
        // 14-18: Afternoon (Beriah -> Yetzirah)
        // 18-20: Sunset (Yetzirah -> Asiyah)
        // 20-6: Night (Profound Asiyah)
        
        if (time >= 10 && time <= 14) return { world: 'ATZILUT', factor: 1 };
        if (time > 6 && time < 10) return { world: 'RISING', factor: (time - 6) / 4 };
        if (time > 14 && time < 18) return { world: 'SETTING', factor: (time - 14) / 4 };
        return { world: 'ASIYAH', factor: 0 };
    }

    manifestAtmosphere(cycle) {
        let targetColor = this.asiyahColor.clone();
        
        if (cycle.world === 'ATZILUT') {
            targetColor = this.atzilutColor;
        } else if (cycle.world === 'RISING') {
            targetColor.lerp(this.beriahColor, cycle.factor);
        } else if (cycle.world === 'SETTING') {
            targetColor = this.beriahColor.clone().lerp(this.yetzirahColor, cycle.factor);
        }

        this.scene.background.copy(targetColor);
        if (this.scene.fog) {
            this.scene.fog.color.copy(targetColor);
            // Night is denser Asiyah, Day is clearer Atzilut
            this.scene.fog.density = THREE.MathUtils.lerp(0.015, 0.005, cycle.factor);
        }
        
        this.skyVessel.material.color.copy(targetColor);
    }

    updateSunPosition() {
        const time = this.gameTime;
        // Sun moves in a sacred arc
        const angle = (time / 24) * Math.PI * 2 + Math.PI;
        const radius = 500;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = Math.sin(angle * 0.5) * radius * 0.5;

        this.olam.mainSun.position.set(x, y, z);
        
        // Intensity of Divine Hashgacha fades at night
        const intensity = Math.max(0, Math.sin(angle - Math.PI));
        this.olam.mainSun.intensity = intensity * 1.8;
    }
}
