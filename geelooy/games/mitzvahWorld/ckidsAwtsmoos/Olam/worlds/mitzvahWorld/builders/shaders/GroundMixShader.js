/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE SHADER OF THE SACRED SOIL — GroundMixShader.js
 *   ──────────────────────────────────────────────────
 *   "And G-d said: Let the earth bring forth grass..." — Bereishis 1:11
 *
 *   This is the alchemy of the Malchus. We mix the humble, brown
 *   dust of the earth (DIRT) with the vibrant, proliferating
 *   life of the field (GRASS).
 *
 *   The mixture is not random; it is guided by the hidden patterns
 *   of fractal noise — the same mathematics the Awtsmoos uses to 
 *   scatter the seeds across the primordial plane.
 *
 *   Features:
 *     - Mixes two curated colors (Dirt & Grass)
 *     - Uses Simplex Noise for organic blending
 *     - High-frequency "grit" for realistic soil texture
 *     - Procedural and modular.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module GroundMixShader
 */

import * as THREE from '/games/scripts/build/three.module.js';

/**
 * @function createGroundMixMaterial
 * @description
 *   Creates a THREE.ShaderMaterial that blends dirt and grass.
 *   
 * @param {Object} options
 * @param {THREE.Color} [options.dirtColor]  - The color of the humble earth
 * @param {THREE.Color} [options.grassColor] - The color of the growing life
 * @param {number}      [options.scale]      - The fractal scale of the mix
 * @returns {THREE.ShaderMaterial}
 */
export function createGroundMixMaterial({
  dirtColor  = new THREE.Color(0x5d4037), // A deep, humble brown
  grassColor = new THREE.Color(0x2e7d32), // A rich, life-filled green
  scale      = 0.05,
} = {}) {

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    uniform vec3 dirtColor;
    uniform vec3 grassColor;
    uniform float mixScale;

    // B"H: Simplex Noise (Ashima Arts)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // ── The Fractal Mix ──
      float n = snoise(vWorldPosition.xz * mixScale);
      n += 0.5 * snoise(vWorldPosition.xz * mixScale * 2.1);
      n += 0.25 * snoise(vWorldPosition.xz * mixScale * 4.3);
      
      float mask = smoothstep(-0.2, 0.6, n);
      
      // ── High Frequency Grit ──
      float grit = snoise(vWorldPosition.xz * 15.0) * 0.08;
      
      vec3 base = mix(dirtColor, grassColor, mask);
      vec3 finalColor = base + vec3(grit);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms: {
      dirtColor:  { value: dirtColor },
      grassColor: { value: grassColor },
      mixScale:   { value: scale },
    },
    vertexShader,
    fragmentShader,
  });
}

export default createGroundMixMaterial;
