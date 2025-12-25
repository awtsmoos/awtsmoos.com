// B"H
/**
 * WeatherEffects - Fast, shader-based atmospheric phenomena.
 * Pure WebGL for maximum compatibility.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class WeatherEffects {
    constructor(olam) {
        this.olam = olam;
        this.initRain();
        this.initLightning();
        this.initRainbow();
        
        this.lightningTimer = 0;
        this.thunderTimer = 0;
    }

    initRain() {
        const particleCount = 15000;
        const size = 60; // Box size around camera
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * size;
            positions[i + 1] = Math.random() * size;
            positions[i + 2] = (Math.random() - 0.5) * size;
            velocities[i / 3] = Math.random() * 0.5 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uSize: { value: size },
                uIntensity: { value: 0 },
                uColor: { value: new THREE.Color(0xbbccff) }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uSize;
                uniform float uIntensity;
                attribute float velocity;
                varying float vAlpha;

                void main() {
                    vec3 pos = position;
                    // Move down over time
                    pos.y -= uTime * 40.0 * velocity;
                    // Wrap inside the box
                    pos.y = mod(pos.y, uSize);
                    
                    vAlpha = uIntensity * (1.0 - (pos.y / uSize));
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = 2.0 * (30.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying float vAlpha;
                void main() {
                    if (vAlpha < 0.01) discard;
                    gl_FragColor = vec4(uColor, vAlpha * 0.6);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.rainParticles = new THREE.Points(geometry, material);
        this.rainParticles.frustumCulled = false;
        this.olam.scene.add(this.rainParticles);
    }

    initLightning() {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        this.lightningMesh = new THREE.Line(geometry, material);
        this.lightningMesh.visible = false;
        this.olam.scene.add(this.lightningMesh);
    }

    initRainbow() {
        const geometry = new THREE.TorusGeometry(100, 2, 8, 50, Math.PI);
        const material = new THREE.ShaderMaterial({
            uniforms: { uIntensity: { value: 0 } },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float uIntensity;
                vec3 rainbow(float t) {
                    vec3 c = 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
                    return c;
                }
                void main() {
                    float edge = sin(vUv.x * 3.14159);
                    vec3 col = rainbow(vUv.y);
                    gl_FragColor = vec4(col, uIntensity * edge * 0.4);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        this.rainbow = new THREE.Mesh(geometry, material);
        this.rainbow.rotation.x = Math.PI / 2;
        this.rainbow.position.y = -20; // Horizon
        this.rainbow.visible = false;
        this.olam.scene.add(this.rainbow);
    }

    /**
     * Updates the visual pulse of the atmosphere.
     */
    update(dt, type, intensity, gameTime) {
        const player = this.olam.player;
        if (!player || !player.mesh) return;

        // 1. Follow Player
        this.rainParticles.position.copy(player.mesh.position);
        this.rainParticles.position.y -= 10; 
        
        // 2. Update Uniforms
        this.rainParticles.material.uniforms.uTime.value += dt;
        this.rainParticles.material.uniforms.uIntensity.value = intensity;

        // 3. Lightning Flash (Only in Storm)
        if (type === 'STORM' && intensity > 0.8) {
            this.lightningTimer -= dt;
            if (this.lightningTimer <= 0) {
                this.triggerLightning();
                this.lightningTimer = Math.random() * 5 + 2;
            }
        }

        // 4. Rainbow Logic
        const isDay = gameTime > 6 && gameTime < 18;
        if (isDay && intensity > 0.1 && type !== 'STORM') {
            this.rainbow.visible = true;
            this.rainbow.material.uniforms.uIntensity.value = intensity * (1.0 - intensity); 
            this.rainbow.position.x = player.mesh.position.x;
            this.rainbow.position.z = player.mesh.position.z - 200; 
        } else {
            this.rainbow.visible = false;
        }
    }

    triggerLightning() {
        const olam = this.olam;
        const originalBg = olam.scene.background.clone();
        olam.scene.background.set(0xffffff);
        
        setTimeout(() => {
            olam.scene.background.copy(originalBg);
        }, 50 + Math.random() * 100);

        olam.playSound("awtsmoos://thunder"); 
    }
}
