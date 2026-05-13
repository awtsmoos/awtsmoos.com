
/**
 * B"H
 * @module IntenseNpcMesh
 * @description
 * 💎 THE VESSEL OF INNER LIGHT 💎
 * 
 * "The soul of man is the candle of God." (Mishlei 20:27)
 * 
 * THE TIKKUN OF PERFORMANCE:
 * Previously, every intense NPC manifested a THREE.PointLight. In WebGL forward 
 * rendering, every light forces every material in the entire world to recompile 
 * and perform N-light mathematical passes per pixel. 10 NPCs meant 10 lights, 
 * causing the framerate to shatter into the abyss.
 * 
 * We have utterly eradicated the PointLight. The glow now comes from within!
 * We use an extreme emissive material setup that looks identical but costs 
 * absolutely nothing in rendering performance.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class IntenseNpcMesh {
    /**
     * @function build
     * @description Constructs the intense spiritual vessel.
     * @param {string} hexColor - The aura color of the soul.
     * @returns {THREE.Group} The assembled procedural entity.
     */
    static build(hexColor = "#00ffff") {
        const group = new THREE.Group();

        // 1. The Core (Lev / Heart)
        const coreGeo = new THREE.OctahedronGeometry(0.4, 2);
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: new THREE.Color(hexColor),
            // B"H: We crank the emissive intensity to the heavens!
            // When combined with bloom/post-processing, this outshines any PointLight.
            emissiveIntensity: 5.0, 
            roughness: 0.1,
            metalness: 0.9,
            wireframe: true
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 1.0;
        group.add(core);

        // 2. The Orbits (Ohr Makif - Encompassing Light)
        const orbitGroup = new THREE.Group();
        orbitGroup.position.y = 1.0;
        
        const crystalGeo = new THREE.TetrahedronGeometry(0.15, 0);
        const crystalMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(hexColor),
            emissive: new THREE.Color(hexColor),
            emissiveIntensity: 2.0, // Glows brightly
            roughness: 0.0,
            metalness: 1.0,
            transparent: true,
            opacity: 0.9
        });

        for (let i = 0; i < 4; i++) {
            const crystal = new THREE.Mesh(crystalGeo, crystalMat);
            const angle = (i / 4) * Math.PI * 2;
            crystal.position.set(Math.cos(angle) * 0.8, 0, Math.sin(angle) * 0.8);
            
            // Random spin for each crystal
            crystal.rotation.set(Math.random(), Math.random(), Math.random());
            orbitGroup.add(crystal);
        }

        group.add(orbitGroup);

        // B"H: Attach a custom update function to be called in the Olam loop
        group.userData.onUpdate = (dt) => {
            const time = performance.now() * 0.001;
            // Core breathing
            const scale = 1.0 + Math.sin(time * 2) * 0.1;
            core.scale.set(scale, scale, scale);
            
            // Orbit spinning
            orbitGroup.rotation.y += dt * 2.0;
            orbitGroup.rotation.z = Math.sin(time) * 0.2;
            
            // Crystals tumbling
            orbitGroup.children.forEach(c => {
                c.rotation.x += dt * 1.5;
                c.rotation.y += dt * 1.5;
            });
        };

        // B"H: Create an invisible physical proxy so it can be interacted with
        const proxyGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.0);
        const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
        const proxy = new THREE.Mesh(proxyGeo, proxyMat);
        proxy.position.y = 1.0;
        proxy.userData.isSolid = true; // Allows interaction raycasting
        group.add(proxy);

        return group;
    }
}
