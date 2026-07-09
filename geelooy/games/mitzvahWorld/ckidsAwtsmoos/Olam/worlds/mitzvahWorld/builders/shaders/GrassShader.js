/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE SWAYING BREATH OF NETZACH — GrassShader.js
 *   ──────────────────────────────────────────────
 *   "All the trees of the field shall clap their hands." — Yeshayahu 55:12
 *
 *   The grass is not static; it is a living being, constantly 
 *   responding to the invisible breath of the Creator (the Wind).
 *
 *   This shader breathes life into the instanced grass blades,
 *   making them sway in a rhythmic, fractal dance.
 *
 *   Features:
 *     - Vertex-based swaying using Sine and Time
 *     - Color variation per instance for realism
 *     - Efficient for high-count InstancedMesh.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module GrassShader
 */

import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10';

/**
 * @function createGrassMaterial
 * @description
 *   Creates a ShaderMaterial for swaying grass.
 *
 * @param {Object} options
 * @param {THREE.Color} [options.color] - Base green color
 * @returns {THREE.ShaderMaterial}
 */
export function createGrassMaterial({
  color = new THREE.Color(0x5cb85c)
} = {}) {

  const vertexShader = `
    varying vec2 vUv;
    varying float vInstanceId;
    uniform float time;

    void main() {
      vUv = uv;
      
      // ── Instance Transform ──
      // THREE.InstancedMesh sets 'instanceMatrix' as an attribute
      vec4 worldPosition = instanceMatrix * vec4(position, 1.0);

      // ── Swaying Logic ──
      // Only sway the upper parts of the blade (y > 0 relative to bottom)
      // We assume geometry center is at y=0.5 for a 1-unit high blade
      float strength = (position.y + 0.5); // 0 at bottom, 1 at top
      
      float sway = sin(time * 2.0 + worldPosition.x * 0.5 + worldPosition.z * 0.5) * 0.2;
      sway += sin(time * 4.0 + worldPosition.x * 1.2) * 0.05;
      
      worldPosition.x += sway * strength;
      worldPosition.z += sway * 0.5 * strength;

      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform vec3 baseColor;
    
    void main() {
      // ── Color Gradient ──
      // Darker at the bottom, lighter at the top
      vec3 finalColor = mix(baseColor * 0.5, baseColor * 1.2, vUv.y);
      
      // Simple lighting shadow simulation
      finalColor *= (0.8 + 0.2 * vUv.x);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: color },
      time:      { value: 0 },
    },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
  });
}

export default createGrassMaterial;
