/**
 * B"H
 * custom tree sway texture
 */
import * as THREE from '/games/scripts/build/three.module.js';

let vs='vertexShader';
let ck = THREE.ShaderChunk;

export default function TreeShader(s){
    // B"H: Initialize with 0. The time value must be updated per frame by the entity that uses this material.
    // Relying on a getter in the uniform object is risky as Three.js might clone it into a plain value.
    s.uniforms.uTime = { value: 0 };
    
    s[vs]=`
    varying vec3 vPosWorld;
    uniform float uTime;
    `+s[vs];
    
    let pv = ck.project_vertex;
    pv = pv.replace(`mvPosition = modelViewMatrix * mvPosition;`,/*glsl*/`
        vPosWorld = vec3(modelMatrix * mvPosition);
        mvPosition = modelViewMatrix * mvPosition;
        float offset = pow((vPosWorld.y-modelMatrix[3].y)*.1,2.);
        vPosWorld.x += .02*offset*sin(uTime*2.5);
        mvPosition = viewMatrix * vec4(vPosWorld,1.);
    `);
    
    s[vs]=s[vs].replace(`#include <project_vertex>`,pv);
    
    // Store shader ref for external updates
    // The calling code (e.g. proceduralTree.js) is responsible for updating s.uniforms.uTime.value
}