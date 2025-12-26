/**
 * B"H
 * RainEffect - WebGL Compatible Version
 */

import * as THREE from '/games/scripts/build/three.module.js';

export default class RainEffect {
    constructor({
        scene, 
        renderer,
        camera,
        boundingBox, 
        density = 0.13,
        dropSpeed = 10,
        dropLength = 0.05,
        maxParticleCount = 15000
    }) {
        this.scene = scene;
        this.boundingBox = boundingBox || new THREE.Box3(new THREE.Vector3(-50, 0, -50), new THREE.Vector3(50, 50, 50));
        this.count = maxParticleCount;
        
        this.init();
    }

    init() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        const min = this.boundingBox.min;
        const max = this.boundingBox.max;

        for (let i = 0; i < this.count; i++) {
            // Random position within bounding box
            const x = Math.random() * (max.x - min.x) + min.x;
            const y = Math.random() * (max.y - min.y) + min.y;
            const z = Math.random() * (max.z - min.z) + min.z;
            
            positions.push(x, y, z);
            // Random velocity factor
            velocities.push(Math.random() * 0.5 + 0.5); 
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(0xaaaaaa) },
                uHeightRange: { value: max.y - min.y },
                uMinY: { value: min.y }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uHeightRange;
                uniform float uMinY;
                attribute float velocity;
                varying float vAlpha;

                void main() {
                    vec3 pos = position;
                    
                    // Animate Y
                    float fallSpeed = 20.0 * velocity;
                    float yOffset = mod(uTime * fallSpeed, uHeightRange);
                    
                    pos.y -= yOffset;
                    if(pos.y < uMinY) pos.y += uHeightRange;

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    
                    // Fade out based on height or distance if needed
                    vAlpha = 0.6;

                    gl_PointSize = 2.0 * (50.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying float vAlpha;

                void main() {
                    gl_FragColor = vec4(uColor, vAlpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.rainSystem = new THREE.Points(geometry, material);
        this.rainSystem.frustumCulled = false; // Always render
        this.scene.add(this.rainSystem);
    }

    initRain({ start }) {
        this.startTime = start || Date.now();
        if(this.rainSystem) this.rainSystem.visible = true;
    }

    stop() {
        if(this.rainSystem) {
            this.rainSystem.visible = false;
        }
    }

    update(dt) {
        if (this.rainSystem && this.rainSystem.material.uniforms) {
            this.rainSystem.material.uniforms.uTime.value += dt;
        }
        return true;
    }
}