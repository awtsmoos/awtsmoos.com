
/**
 * B"H
 * Procedural Clouds
 */
import Domem from "../../chayim/domem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { simplex2d } from '../../utils/math/noise.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class ProceduralCloud extends Domem {
    type = "proceduralCloud";
    
    constructor(op, olam) {
        super(op, olam);
        
        this.on("heescheel", (olam) => {
            const geometry = new THREE.PlaneGeometry(500, 500);
            const material = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0.8,
                depthWrite: false,
                color: 0xffffff
            });
            
            // Custom Noise Shader
            material.onBeforeCompile = (shader) => {
                shader.uniforms.uTime = { value: 0 };
                shader.fragmentShader = `
                    uniform float uTime;
                    // Insert Simplex Noise Function here (simplified for inline)
                    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
                    float noise(vec2 p) {
                        vec2 i = floor(p); vec2 f = fract(p);
                        vec2 u = f*f*(3.0-2.0*f);
                        return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                                   mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
                    }
                ` + shader.fragmentShader.replace('#include <map_fragment>', `
                    vec2 uv = vUv * 4.0 + vec2(uTime * 0.05, 0.0);
                    float n = noise(uv);
                    n += noise(uv * 2.0) * 0.5;
                    float cloud = smoothstep(0.4, 0.8, n);
                    diffuseColor = vec4(1.0, 1.0, 1.0, cloud * opacity);
                `);
                material.userData.shader = shader;
            };
            
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.rotation.x = -Math.PI / 2;
            this.mesh.position.y = 50; // Height
            olam.nivrayimGroup.add(this.mesh);
        });
        
        this.on("heesHawvoos", (dt) => {
            if(this.mesh && this.mesh.material.userData.shader) {
                this.mesh.material.userData.shader.uniforms.uTime.value += dt;
            }
        });
    }
}
