
/**
 * B"H
 * environment.js - Managing the Atmosphere of the Olam.
 * 
 * The environment is the "Space" created by the Tzimtzum.
 * It transitions through the spiritual worlds based on the passage of time.
 * Now supercharged with the IntenseSkySystem, forging realistic scattering and lens flares.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import WeatherEffects from './WeatherEffects.js?compact=true&v=crisp-background-budget-20260621-bh2';
import IntenseSkySystem from '../../dvarim/nature/sky/IntenseSkySystem.js?compact=true&v=full-chain-cache-bust-20260708-bh10'; // B"H!

export default class Environment {
    constructor({ scene, olam }) {
        this.scene = scene;
        this.olam = olam;
        this.gameTime = 12; // Start at Noon
        this.timeSpeed = 0.05; // The speed of the Cosmic Clock
        
        this.weatherType = 'CLEAR';
        this.weatherIntensity = 0;
        
        this.weatherEffects = new WeatherEffects(this.olam);
        
        // B"H: Initialize the intense procedural sky!
        this.skySystem = new IntenseSkySystem(this.olam);
        
        // Also provide a main directional light to cast shadows based on sun pos
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 8000;
        const d = 1000;
        this.sunLight.shadow.camera.left = -d;
        this.sunLight.shadow.camera.right = d;
        this.sunLight.shadow.camera.top = d;
        this.sunLight.shadow.camera.bottom = -d;
        
        this.scene.add(this.sunLight);
        this.olam.mainSun = this.sunLight; // Store ref for weather effects
    }

    /**
     * update - The constant pulse of the universe.
     */
    update(dt) {
        this.__environmentAcc = (this.__environmentAcc || 0) + (Number(dt) || 0);
        const step = Math.min(0.25, this.__environmentAcc || dt);
        this.__environmentAcc = 0;
        // 1. Advance the Cosmic Clock
        this.gameTime = (this.gameTime + step * this.timeSpeed) % 24;

        // 2. Update the Intense Sky (which moves the sun and lens flares)
        const cam = this.olam.activeCamera || (this.olam.ayin ? this.olam.ayin.camera : null);
        if (this.skySystem && cam) {
            this.skySystem.update(this.gameTime, cam);
            
            // Sync the physical light to the visual sun
            this.sunLight.position.copy(this.skySystem.sunPosition);
            
            // Dim light at night
            if (this.sunLight.position.y < 0) {
                this.sunLight.intensity = 0;
            } else {
                this.sunLight.intensity = 1.5 * (this.sunLight.position.y / 3500); // Fade based on height
            }
        }

        // 3. Weather Phenomena
        if (this.weatherEffects) {
             this.weatherEffects.update(step, this.weatherType, this.weatherIntensity, this.gameTime);
        }
    }
}
