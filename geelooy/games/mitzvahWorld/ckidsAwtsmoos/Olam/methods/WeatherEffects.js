
// B"H
/**
 * WeatherEffects - The physical phenomena of the spiritual environment.
 * B"H SAFE MODE: Custom shaders disabled.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class WeatherEffects {
    constructor(olam) {
        this.olam = olam;
        this.initGodRays();
        this.initRain();
        this.initRainbow();
    }

    initGodRays() {
        // Safe Mode: Invisible or Standard Material
        const geometry = new THREE.CylinderGeometry(0, 50, 1000, 16, 1, true);
        const material = new THREE.MeshBasicMaterial({
            color: 0xfff5e1,
            transparent: true,
            opacity: 0.05, // Very faint
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.godRays = new THREE.Mesh(geometry, material);
        this.godRays.frustumCulled = false;
        this.olam.scene.add(this.godRays);
    }

    initRain() {
        // Safe Mode: Simple Points
        const count = 5000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = Math.random() * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.rainMat = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });

        this.rainParticles = new THREE.Points(geometry, this.rainMat);
        this.rainParticles.visible = false; // Hidden by default
        this.olam.scene.add(this.rainParticles);
    }

    initRainbow() {
        const geo = new THREE.TorusGeometry(500, 5, 8, 50, Math.PI);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
        this.rainbow = new THREE.Mesh(geo, mat);
        this.rainbow.rotation.x = Math.PI / 2;
        this.rainbow.visible = false;
        this.olam.scene.add(this.rainbow);
    }

    update(dt, type, intensity, gameTime) {
        // 1. Sync God Rays with Sun
        if (this.olam.mainSun) {
            const sunPos = this.olam.mainSun.position.clone();
            this.godRays.position.copy(sunPos);
            this.godRays.lookAt(0, 0, 0);
            this.godRays.rotateX(Math.PI / 2);
            
            const sunUp = sunPos.y > 0;
            this.godRays.visible = sunUp;
        }

        // 2. Rain Update (Basic Falling)
        const raining = intensity > 0;
        this.rainParticles.visible = raining;
        if (raining) {
            if (this.olam.player) {
                this.rainParticles.position.x = this.olam.player.mesh.position.x;
                this.rainParticles.position.z = this.olam.player.mesh.position.z;
            }
            const positions = this.rainParticles.geometry.attributes.position.array;
            for(let i=1; i<positions.length; i+=3) {
                positions[i] -= 20 * dt;
                if(positions[i] < 0) positions[i] = 50;
            }
            this.rainParticles.geometry.attributes.position.needsUpdate = true;
        }

        // 3. Rainbow
        const isRaining = type === 'RAIN' && intensity > 0.2;
        const isDay = gameTime > 6 && gameTime < 18;
        this.rainbow.visible = isRaining && isDay;
    }
}
