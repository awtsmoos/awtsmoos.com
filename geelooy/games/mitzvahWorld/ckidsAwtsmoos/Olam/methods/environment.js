// B"H
/**
 * Environment - Controls the atmosphere, transitions between realms, and the Weather Cycle.
 * Features Celestial Realm shifting, solid cloud jumping, and now: Rain, Storms, and Rainbows.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import WeatherEffects from './WeatherEffects.js';

export default class Environment {
    constructor({ scene, olam }) {
        this.scene = scene;
        this.olam = olam;
        this.gameTime = 12; 
        
        this.heavenlyColor = new THREE.Color(0x241550); // Violet Nebula
        this.earthlyColor = new THREE.Color(0x88ccee);
        this.stormColor = new THREE.Color(0x2f4875);
        
        this.scene.background = this.earthlyColor.clone();
        this.scene.fog = new THREE.Fog(this.earthlyColor.clone(), 1, 1000);
        this.inHeaven = false;

        // Weather Cycle State
        this.weatherType = 'CLEAR'; // CLEAR, RAIN, STORM
        this.weatherIntensity = 0; // 0 to 1
        this.weatherTimer = Math.random() * 300 + 300; // Next change in 5-10 mins
        
        this.weatherEffects = new WeatherEffects(this.olam);
    }

    /**
     * Forces rain to start (Legacy Support)
     */
    startRain() {
        this.weatherType = 'RAIN';
        this.weatherTimer = 300;
        this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Rain Started", color: "cyan" });
    }

    /**
     * Forces rain to stop (Legacy Support)
     */
    stopRain() {
        this.weatherType = 'CLEAR';
        this.weatherTimer = 600;
    }

    /**
     * The Great Update - Refreshes the atmosphere every pulse.
     * @param {number} dt Delta time
     * @param {THREE.Vector3} playerPos Current player position
     */
    update(dt, playerPos) {
        // 1. Time constant creation
        this.gameTime = (this.gameTime + dt * 0.05) % 24;
        
        // 2. Weather Cycle Logic
        this.weatherTimer -= dt;
        if (this.weatherTimer <= 0) {
            this.changeWeather();
        }

        // Smooth transition for weather intensity
        if (this.weatherType !== 'CLEAR' && this.weatherIntensity < 1) {
            this.weatherIntensity = Math.min(1, this.weatherIntensity + dt * 0.2);
        } else if (this.weatherType === 'CLEAR' && this.weatherIntensity > 0) {
            this.weatherIntensity = Math.max(0, this.weatherIntensity - dt * 0.2);
        }

        const isDay = this.gameTime > 6 && this.gameTime < 18;
        const targetBgColor = isDay ? this.earthlyColor.clone() : new THREE.Color(0x050510);
        
        // Darken if storming
        if (this.weatherIntensity > 0) {
            targetBgColor.lerp(this.stormColor, this.weatherIntensity * 0.6);
        }

        // B"H: Safety guard - if player position is not ready, just update basic background
        if (!playerPos || !this.olam.player || !this.olam.player.mesh || isNaN(playerPos.y)) {
             this.scene.background.copy(targetBgColor);
             this.scene.fog.color.copy(targetBgColor);
             return;
        }

        const altitude = playerPos.y;
        
        // 3. ATMOSPHERIC SHIFT
        if (altitude > 40) {
            const factor = Math.min(1, (altitude - 40) / 100);
            const bgColor = targetBgColor.lerp(this.heavenlyColor, factor);
            this.scene.background.copy(bgColor);
            this.scene.fog.color.copy(bgColor);
            
            // GRAVITY CONTRACT (Tzimtzum)
            this.olam.GRAVITY = 30 * (1 - factor * 0.5);

            // REALM TRANSITION (Y > 100)
            if (factor > 0.8 && !this.inHeaven) {
                this.inHeaven = true;
                this.olam.ayshPeula("ui event", "effectsOverlay", { 
                    text: "REACHING CELESTIAL EMPIRE", 
                    color: "gold" 
                });
                this.toggleCloudSolidity(true);
                this.spawnCloudEmpire();
            } else if (factor < 0.2 && this.inHeaven) {
                this.inHeaven = false;
                this.toggleCloudSolidity(false);
            }
        } else {
            this.scene.background.copy(targetBgColor);
            this.scene.fog.color.copy(targetBgColor);
        }

        // 4. Update Weather Visuals
        this.weatherEffects.update(dt, this.weatherType, this.weatherIntensity, this.gameTime);
    }

    /**
     * Changes the destiny of the world's weather.
     */
    changeWeather() {
        const rand = Math.random();
        if (rand < 0.6) {
            this.weatherType = 'CLEAR';
            this.weatherTimer = 600; // Clear for a while
        } else if (rand < 0.9) {
            this.weatherType = 'RAIN';
            this.weatherTimer = 300;
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Gentle Rain", color: "cyan" });
        } else {
            this.weatherType = 'STORM';
            this.weatherTimer = 200;
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Incoming Storm!", color: "#bc13fe" });
        }
    }

    /**
     * Changes cloud entities from background art to solid platforms.
     */
    toggleCloudSolidity(isSolid) {
        this.olam.nivrayim.forEach(n => {
            if (n.type === 'proceduralCloud') {
                n.isSolid = isSolid;
                if (isSolid) {
                    n.mesh.userData.isSolid = true;
                    if(this.olam.worldOctree) this.olam.worldOctree.addObject(n.mesh);
                } else {
                    if(this.olam.worldOctree) this.olam.worldOctree.removeMesh(n.mesh);
                }
            }
        });
    }

    /**
     * Manifests high-altitude portals and platforms.
     */
    async spawnCloudEmpire() {
        if(!this.olam.player || !this.olam.player.mesh) return;

        const center = this.olam.player.mesh.position.clone();
        center.y = 200; // Sky height

        for(let i=0; i<5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const x = center.x + Math.cos(angle) * 20;
            const z = center.z + Math.sin(angle) * 20;
            
            await this.olam.addObject("ProceduralCloud", {
                name: `heaven_island_${i}`,
                position: { x, y: 190 + (Math.random() * 20), z },
                isSolid: true,
                scale: { x: 5, y: 1, z: 5 }
            });
        }
        
        await this.olam.addObject("Portal", {
            name: "Heavenly Gate",
            position: { x: center.x, y: 250, z: center.z },
            worldPath: "world2File", 
            interactable: true
        });
    }
}