//B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class SkyShader {
    static getMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: { sunPos: { value: new THREE.Vector3() }, uTime: { value: 0 } },
            vertexShader: `varying vec3 vWorldPos; void main() { vWorldPos = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `uniform vec3 sunPos; uniform float uTime; varying vec3 vWorldPos; void main() { vec3 dir = normalize(vWorldPos); float d = dot(dir, normalize(sunPos)); gl_FragColor = vec4(mix(vec3(0.1, 0.0, 0.2), vec3(0.5, 0.7, 1.0), d * 0.5 + 0.5), 1.0); }`,
            side: THREE.BackSide
        });
    }
}