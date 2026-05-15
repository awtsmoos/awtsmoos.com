/**
 * B"H
 * @file GroundMixShader.js
 * @description
 * Dirt-first terrain with explicit grass patch points, falloff, and gain.
 *
 * The Awtsmoos is revealed here as a measured covenant between JavaScript
 * strings and GLSL speech: every backtick must close its vessel, every vec2
 * must stay inside the shader-world, and every patch of grass receives its
 * radius, gain, and place without tearing the parser open.
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { MAX_GRASS_PATCHES, normalizeGrassPatches } from './GrassPatchMask.js';

/**
 * Creates the mixed dirt/grass material for the ground mesh.
 *
 * @param {object} [options={}] - The earthly vessel of configurable terrain color.
 * @param {THREE.Color} [options.dirtColor=new THREE.Color(0x5d4037)] - Base dirt color.
 * @param {THREE.Color} [options.grassColor=new THREE.Color(0x2e7d32)] - Base grass color.
 * @param {number} [options.scale=0.05] - World-space scale for the organic noise.
 * @param {Array<{x:number,z:number,radius:number,gain:number}>} [options.grassPatches=[]] - Patch centers and influence.
 * @returns {THREE.ShaderMaterial} A shader material whose uniforms carry patch data into GLSL.
 */
export function createGroundMixMaterial({
  dirtColor = new THREE.Color(0x5d4037),
  grassColor = new THREE.Color(0x2e7d32),
  scale = 0.05,
  grassPatches = []
} = {}) {
  const patches = normalizeGrassPatches(grassPatches);

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
    uniform vec4 grassPatches[${MAX_GRASS_PATCHES}];

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.y * u.x;
    }

    float patchMask(vec2 wp) {
      float m = 0.0;

      for (int i = 0; i < ${MAX_GRASS_PATCHES}; i++) {
        vec4 p = grassPatches[i];
        float r = max(p.z, 0.001);
        float d = distance(wp, p.xy);
        float fade = 1.0 - smoothstep(r * 0.45, r, d);
        m = max(m, fade * p.w);
      }

      return clamp(m, 0.0, 1.0);
    }

    void main() {
      vec2 wp = vWorldPosition.xz;
      float grassPatch = patchMask(wp);
      float organic = noise(wp * mixScale);
      float grass = clamp(mix(0.12, 1.0, grassPatch) + organic * 0.15, 0.0, 1.0);
      float grit = (noise(wp * 12.0) - 0.5) * 0.08;
      vec3 color = mix(dirtColor, grassColor, grass) + vec3(grit);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms: {
      dirtColor: { value: dirtColor },
      grassColor: { value: grassColor },
      mixScale: { value: scale },
      grassPatches: {
        value: patches.map(patch => new THREE.Vector4(patch.x, patch.z, patch.radius, patch.gain))
      }
    },
    vertexShader,
    fragmentShader
  });
}

export default createGroundMixMaterial;
