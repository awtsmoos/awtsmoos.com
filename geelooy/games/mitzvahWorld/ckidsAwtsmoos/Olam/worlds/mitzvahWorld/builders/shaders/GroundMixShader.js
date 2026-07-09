/**
 * B"H
 * @file GroundMixShader.js
 * @description Remote multi-texture ground, mixed layer by layer in GLSL.
 *
 * The Awtsmoos speaks one earth from many pictures: first texture with second
 * in random islands, then the result itself receives the third, fourth, fifth,
 * and every later garment. The shader is generated from the texture count, so
 * more layers can descend without changing the covenant below.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { MAX_GRASS_PATCHES, normalizeGrassPatches } from './GrassPatchMask.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { normalizeGroundTextureUrls } from './GroundTextureConfig.js?compact=true&v=hosted-ground-textures-20260708-bh1';
import { createGroundTextureUniforms, loadGroundTextures } from './GroundTextureLoader.js?compact=true&v=hosted-ground-textures-20260708-bh1';

function samplerUniforms(count) {
  return Array.from({ length:count }, (_, i) => `uniform sampler2D groundTexture${i};`).join("\n");
}

function textureMixLines(count) {
  const lines = [`vec3 mixed = texture2D(groundTexture0, uvForLayer(wp, 0.0)).rgb;`];
  for (let i = 1; i < count; i += 1) {
    lines.push(`mixed = mix(mixed, texture2D(groundTexture${i}, uvForLayer(wp, ${i}.0)).rgb, layerMask(wp, ${i}.0, grassPatch));`);
  }
  return lines.join("\n      ");
}

function vertexShader() {
  return `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
}

function fragmentShader(textureCount) {
  return `
    precision highp float;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    uniform float textureScale;
    uniform float randomScale;
    uniform vec3 fallbackColor;
    uniform vec4 grassPatches[${MAX_GRASS_PATCHES}];
    ${samplerUniforms(textureCount)}
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      float a = hash(i), b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.y * u.x;
    }
    float patchMask(vec2 wp) {
      float m = 0.0;
      for (int i = 0; i < ${MAX_GRASS_PATCHES}; i++) {
        vec4 p = grassPatches[i];
        float r = max(p.z, 0.001);
        m = max(m, (1.0 - smoothstep(r * 0.45, r, distance(wp, p.xy))) * p.w);
      }
      return clamp(m, 0.0, 1.0);
    }
    vec2 uvForLayer(vec2 wp, float layer) {
      vec2 drift = vec2(hash(vec2(layer, 9.1)), hash(vec2(3.7, layer))) * 23.0;
      return wp * textureScale * (1.0 + layer * 0.037) + drift;
    }
    float layerMask(vec2 wp, float layer, float grassPatch) {
      float islands = noise(wp * (randomScale + layer * 0.013) + layer * 19.17);
      float veins = noise(wp * (randomScale * 3.7 + layer * 0.041) - layer * 7.31);
      float spots = smoothstep(0.37, 0.88, islands + veins * 0.28);
      float patchBias = layer == 1.0 ? grassPatch * 0.32 : grassPatch * 0.13;
      return clamp(spots * (0.28 + layer * 0.085) + patchBias, 0.08, 0.82);
    }
    void main() {
      vec2 wp = vWorldPosition.xz;
      float grassPatch = patchMask(wp);
      ${textureMixLines(textureCount)}
      float grit = (noise(wp * 9.0) - 0.5) * 0.075;
      vec3 lit = mix(fallbackColor, mixed + vec3(grit), 0.94);
      float light = clamp(0.70 + dot(normalize(vNormal), normalize(vec3(0.25, 0.85, 0.35))) * 0.30, 0.56, 1.0);
      gl_FragColor = vec4(lit * light, 1.0);
    }
  `;
}

export function createGroundMixMaterial(options = {}) {
  const textureUrls = normalizeGroundTextureUrls(options.textureUrls || options.textures);
  const patches = normalizeGrassPatches(options.grassPatches || []);
  const material = new THREE.ShaderMaterial({
    uniforms:{
      ...createGroundTextureUniforms(THREE, textureUrls),
      textureScale:{ value:Number(options.textureScale || options.scale || 0.085) },
      randomScale:{ value:Number(options.randomScale || 0.055) },
      fallbackColor:{ value:options.fallbackColor || new THREE.Color(0x3f6f2d) },
      grassPatches:{ value:patches.map(p => new THREE.Vector4(p.x, p.z, p.radius, p.gain)) }
    },
    vertexShader:vertexShader(),
    fragmentShader:fragmentShader(textureUrls.length),
    side:THREE.DoubleSide,
    transparent:false,
    depthWrite:true,
    depthTest:true,
    name:"awtsmoos_hosted_ground_mix_shader"
  });
  material.userData = { hostedGroundTextures:true, textureUrls, textureCount:textureUrls.length };
  loadGroundTextures(THREE, textureUrls, material, { repeat:options.repeat, anisotropy:options.anisotropy });
  return material;
}

export default createGroundMixMaterial;
