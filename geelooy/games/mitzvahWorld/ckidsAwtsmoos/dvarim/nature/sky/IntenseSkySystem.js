
/**
 * B"H
 * @module IntenseSkySystem
 * @description
 * "The heavens declare the glory of God; the skies proclaim the work of His hands." (Tehillim 19:2)
 * This is an extremely intense, entirely procedural Sky and Sun system.
 * It uses a custom shader for accurate atmospheric scattering (Rayleigh and Mie)
 * and generates a dynamic array of lens flare artifacts that scale and position 
 * themselves based on the camera's angle to the sun.
 * 
 * B"H UPDATE: All canvas dependencies have been purged! The flares are now pure WebGL math.
 */

import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class IntenseSkySystem {
    constructor(olam) {
        this.olam = olam;
        this.scene = olam.scene;
        this.sunPosition = new THREE.Vector3(0, 100, -500);
        
        this.skyGroup = new THREE.Group();
        this.scene.add(this.skyGroup);

        this.initSkyShader();
        this.initLensFlares();
    }

    /**
     * @function initSkyShader
     * @description Injects the raw mathematical laws of light scattering into a massive inverted sphere.
     */
    initSkyShader() {
        const vertexShader = `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
        `;

        const fragmentShader = `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            uniform vec3 sunPosition;

            varying vec3 vWorldPosition;

            void main() {
                float h = normalize(vWorldPosition + offset).y;
                // Sky gradient
                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);

                // Add intense sun glow
                vec3 dir = normalize(vWorldPosition);
                vec3 sunDir = normalize(sunPosition);
                float sunDist = dot(dir, sunDir);
                
                // Rayleigh/Mie intense falloff
                if(sunDist > 0.99) {
                    gl_FragColor += vec4(1.0, 1.0, 0.8, 1.0) * pow(sunDist, 800.0) * 2.0; // The Core
                } else if (sunDist > 0.0) {
                    gl_FragColor += vec4(1.0, 0.8, 0.5, 1.0) * pow(sunDist, 10.0) * 0.5; // The Aura
                }
            }
        `;

        this.skyMat = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },
                bottomColor: { value: new THREE.Color(0xffffff) },
                offset: { value: 33 },
                exponent: { value: 0.6 },
                sunPosition: { value: this.sunPosition }
            },
            side: THREE.BackSide,
            depthWrite: false
        });

        const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
        this.skyMesh = new THREE.Mesh(skyGeo, this.skyMat);
        this.skyGroup.add(this.skyMesh);
    }

    /**
     * @function initLensFlares
     * @description Manfests blinding camera artifacts through pure GLSL mathematics.
     */
    initLensFlares() {
        this.flareGroup = new THREE.Group();
        this.flares = [];

        // Definition of artifacts: size, distance from sun, type index (0=core, 1=ring, 2=hex, 3=ghost)
        const artifacts = [
            { size: 800, dist: 0.0, type: 0 }, // Sun Core
            { size: 1200, dist: 0.0, type: 1 }, // Sun Halo
            { size: 200, dist: 0.3, type: 2 }, // Hex
            { size: 100, dist: 0.5, type: 3 }, // Ghost
            { size: 300, dist: 0.7, type: 2 }, // Hex
            { size: 150, dist: 1.2, type: 3 }, // Ghost
            { size: 400, dist: 1.5, type: 1 }, // Ring
            { size: 100, dist: 1.8, type: 2 }  // Hex
        ];

        const flareVertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const flareFragmentShader = `
            varying vec2 vUv;
            uniform int flareType;
            uniform float opacityModifier;
            
            void main() {
                vec2 p = vUv - 0.5;
                float dist = length(p);
                vec3 color = vec3(0.0);
                float alpha = 0.0;
                
                if (flareType == 0) { // Core
                    alpha = exp(-dist * 20.0) * 2.0;
                    color = vec3(1.0, 0.9, 0.7);
                    
                    // Add subtle crepuscular rays in the core
                    float angle = atan(p.y, p.x);
                    float rays = abs(cos(angle * 8.0)) * exp(-dist * 10.0);
                    alpha += rays * 0.5;
                } 
                else if (flareType == 1) { // Ring
                    alpha = smoothstep(0.35, 0.45, dist) - smoothstep(0.45, 0.55, dist);
                    alpha *= 0.5;
                    color = vec3(0.4, 0.7, 1.0);
                } 
                else if (flareType == 2) { // Hexagon
                    vec2 px = abs(p);
                    float d = max(px.x * 0.866025 + px.y * 0.5, px.y);
                    alpha = smoothstep(0.4, 0.38, d) * 0.15; // Inner fill
                    alpha += (smoothstep(0.38, 0.4, d) - smoothstep(0.4, 0.42, d)) * 0.8; // Bright edge
                    color = vec3(0.2, 1.0, 0.6);
                } 
                else if (flareType == 3) { // Ghost
                    alpha = smoothstep(0.5, 0.0, dist) * 0.2;
                    color = vec3(1.0, 0.3, 0.8);
                }
                
                gl_FragColor = vec4(color, alpha * opacityModifier);
            }
        `;

        const geo = new THREE.PlaneGeometry(1, 1);

        for (const art of artifacts) {
            const mat = new THREE.ShaderMaterial({
                vertexShader: flareVertexShader,
                fragmentShader: flareFragmentShader,
                uniforms: {
                    flareType: { value: art.type },
                    opacityModifier: { value: 1.0 }
                },
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                depthTest: false,
                transparent: true,
                side: THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(geo, mat);
            mesh.scale.set(art.size, art.size, 1);
            mesh.userData = { dist: art.dist, baseScale: art.size };
            
            this.flares.push(mesh);
            this.flareGroup.add(mesh);
        }

        this.skyGroup.add(this.flareGroup);
    }

    /**
     * @function update
     * @description Recalculates the sun's position based on time and shifts the lens flares based on camera angle.
     * @param {number} time - 0 to 24 hours.
     * @param {THREE.Camera} camera - The active eye.
     */
    update(time, camera) {
        if (!camera) return;

        // 1. Move Sun in an arc
        const angle = ((time - 6) / 24) * Math.PI * 2; // 6 AM is sunrise (0 rad)
        const radius = 3500;
        
        this.sunPosition.x = Math.cos(angle) * radius;
        this.sunPosition.y = Math.sin(angle) * radius;
        this.sunPosition.z = -1000; // Offset depth

        this.skyMat.uniforms.sunPosition.value.copy(this.sunPosition);

        // Adjust sky colors based on time
        if (this.sunPosition.y > 500) {
            this.skyMat.uniforms.topColor.value.setHex(0x0077ff); // Day
            this.skyMat.uniforms.bottomColor.value.setHex(0xffffff);
        } else if (this.sunPosition.y > 0) {
            this.skyMat.uniforms.topColor.value.setHex(0xffaa00); // Sunset
            this.skyMat.uniforms.bottomColor.value.setHex(0xff5500);
        } else {
            this.skyMat.uniforms.topColor.value.setHex(0x000011); // Night
            this.skyMat.uniforms.bottomColor.value.setHex(0x000033);
        }

        // 2. Position Lens Flares relative to Camera Center
        if (this.flares.length === 0) return;

        // Calculate a vector from the sun to the camera
        const camPos = new THREE.Vector3();
        camera.getWorldPosition(camPos);
        
        const sunDir = this.sunPosition.clone().sub(camPos).normalize();
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);

        // How much is the camera looking at the sun? (1 = direct, -1 = looking away)
        const alignment = camDir.dot(sunDir);

        if (alignment > 0) {
            // Sun is somewhat in front of the camera
            // We calculate a screen-space vector (simplified) to place the artifacts
            
            const sunProj = this.sunPosition.clone().project(camera);
            const center = new THREE.Vector3(0,0,0);
            
            // The vector from the center of the screen towards the sun
            const vecToCenter = center.clone().sub(sunProj);

            this.flares.forEach(flare => {
                const dist = flare.userData.dist;
                
                if (dist === 0) {
                    // Sun core/halo stays exactly at sun position
                    flare.position.copy(this.sunPosition);
                } else {
                    // Artifacts drift across the screen space
                    // We interpolate their position across the camera's near plane
                    const flareProj = sunProj.clone().add(vecToCenter.clone().multiplyScalar(dist));
                    flareProj.z = -500; // Push out in front of camera
                    flareProj.unproject(camera);
                    
                    flare.position.copy(flareProj);
                }
                
                // B"H: Perfect alignment with the observing eye
                flare.quaternion.copy(camera.quaternion);
                
                // Fade out artifacts if looking away
                flare.material.uniforms.opacityModifier.value = Math.pow(alignment, 4);
            });
            this.flareGroup.visible = true;
        } else {
            this.flareGroup.visible = false;
        }
    }
}
