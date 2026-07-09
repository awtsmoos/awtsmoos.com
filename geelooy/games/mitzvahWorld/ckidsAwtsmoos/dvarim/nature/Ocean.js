/**
 * B"H
 * Ocean.js - The Great Waters (Yam HaGadol)
 * "And the Spirit of G-d hovered over the face of the waters..." (Bereishis 1:2)
 * 
 * CHAPTER 19: THE SEA OF RADIANCE
 * A vast, shimmering plane of water that surrounds the islands of the Emerald Village.
 */
import Domem from "../../chayim/domem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class Ocean extends Domem {
    type = "Ocean";

    constructor(op, olam) {
        super(op, olam);
        this.size = op.size || 5000;
        this.y = op.y || -1;
        this.color = op.color || 0x00aadd;
    }

    async heescheel(olam) {
        this.olam = olam;
        
        const geometry = new THREE.PlaneGeometry(this.size, this.size, 128, 128);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(this.color) },
                uFogColor: { value: olam.scene.fog.color },
                uFogNear: { value: olam.scene.fog.near },
                uFogFar: { value: olam.scene.fog.far }
            },
            vertexShader: `
                varying vec2 vUv;
                varying float vElevation;
                uniform float uTime;
                
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    float elevation = sin(pos.x * 0.1 + uTime) * 0.5 +
                                     sin(pos.y * 0.15 + uTime * 0.8) * 0.3 +
                                     cos((pos.x + pos.y) * 0.05 + uTime * 0.5) * 0.2;
                    pos.z += elevation;
                    vElevation = elevation;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uColor;
                uniform vec3 uFogColor;
                uniform float uFogNear;
                uniform float uFogFar;
                varying vec2 vUv;
                varying float vElevation;
                
                void main() {
                    float depth = gl_FragCoord.z / gl_FragCoord.w;
                    float fogFactor = smoothstep(uFogNear, uFogFar, depth);
                    
                    float light = vElevation * 0.5 + 0.5;
                    vec3 color = mix(uColor, vec3(1.0), light * 0.2);
                    
                    gl_FragColor = vec4(mix(color, uFogColor, fogFactor), 0.8);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.y = this.y;
        
        await olam.hoyseef(this);
        this.isReady = true;
    }

    heesHawvoos(dt) {
        if (this.mesh && this.mesh.material.uniforms) {
            this.mesh.material.uniforms.uTime.value += dt;
        }
    }
}
