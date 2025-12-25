//B"H
/**
 * B"H
 * @file fire.js
 * A procedural fire entity using shaders and dynamic lighting.
 */
import Domem from "../chayim/domem.js";
import * as THREE from '/games/scripts/build/three.module.js';

const fireVertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const fireFragmentShader = `uniform float uTime; varying vec2 vUv; float rand(vec2 co) { return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); } float noise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(rand(i + vec2(0.0,0.0)), rand(i + vec2(1.0,0.0)), f.x), mix(rand(i + vec2(0.0,1.0)), rand(i + vec2(1.0,1.0)), f.x), f.y); } void main() { vec2 uv = vUv; float n = noise(uv * 10.0 + vec2(0.0, -uTime * 4.0)); float shape = 1.0 - smoothstep(0.1, 1.0, uv.y + abs(uv.x - 0.5) * 2.0); float strength = shape * (n + 0.5); vec3 col = vec3(0.0); if(strength > 0.8) col = vec3(1.0, 1.0, 0.8); else if(strength > 0.6) col = vec3(1.0, 0.8, 0.0); else if(strength > 0.3) col = vec3(1.0, 0.2, 0.0); float alpha = smoothstep(0.1, 0.3, strength); gl_FragColor = vec4(col, alpha); }`;

export default class Fire extends Domem {
    type = "fire";
    constructor(op, olam) { super(op, olam); this.heesHawveh = true; this.baseIntensity = op.intensity || 1.5; }
    async heescheel(olam) {
        this.olam = olam;
        const mat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 } }, vertexShader: fireVertexShader, fragmentShader: fireFragmentShader, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
        const p1 = new THREE.Mesh(new THREE.PlaneGeometry(1, 2), mat);
        const p2 = p1.clone(); p2.rotation.y = Math.PI / 2;
        this.mesh = new THREE.Group(); this.mesh.add(p1, p2);
        this.light = new THREE.PointLight(0xff6600, this.baseIntensity, 10); this.light.position.y = 0.5; this.mesh.add(this.light);
        if(this.position) this.mesh.position.copy(this.position.vector3());
        await olam.hoyseef(this); this.isReady = true;
    }
    heesHawvoos(dt) {
        if(this.mesh && this.mesh.children[0].material.uniforms) {
            this.mesh.children[0].material.uniforms.uTime.value += dt;
            const t = Date.now() / 1000;
            this.light.intensity = this.baseIntensity + Math.sin(t * 10) * 0.2 + (Math.random() - 0.5) * 0.1;
        }
    }
}