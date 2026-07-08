//B"H
/**
 * B"H
 * @file proceduralRiver.js
 */
import Domem from "../../chayim/domem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class ProceduralRiver extends Domem {
    type = "proceduralRiver";
    constructor(op, olam) { super(op, olam); this.points = op.points || []; this.width = op.width || 2; this.heesHawveh = true; }
    async heescheel(olam) {
        this.olam = olam; if (this.points.length < 2) return;
        const curve = new THREE.CatmullRomCurve3(this.points.map(p => new THREE.Vector3(p.x, p.y, p.z)));
        const geometry = new THREE.TubeGeometry(curve, 20, this.width / 2, 8, false);
        const material = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0x00aadd) } }, vertexShader: `varying vec2 vUv; uniform float uTime; void main() { vUv = uv; vec3 pos = position; pos.y += sin(pos.x * 2.0 + uTime) * 0.1; gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0); }`, fragmentShader: `uniform float uTime; uniform vec3 uColor; varying vec2 vUv; void main() { float foam = sin(vUv.x * 20.0 + uTime * 2.0) * 0.5 + 0.5; gl_FragColor = vec4(mix(uColor, vec3(1.0), foam * 0.3), 0.8); }`, transparent: true, side: THREE.DoubleSide });
        this.mesh = new THREE.Mesh(geometry, material); this.mesh.scale.y = 0.1; await olam.hoyseef(this); this.isReady = true;
    }
    heesHawvoos(dt) { if(this.mesh && this.mesh.material.uniforms) this.mesh.material.uniforms.uTime.value += dt; }
}