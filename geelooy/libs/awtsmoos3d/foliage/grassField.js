// B"H
/**
 * @file grassField.js
 * @description
 * Chapter 546: grass becomes a one-time shader instead of a texture request.
 * The Awtsmoos bends every blade in the vertex prayer and cuts its silhouette
 * in the fragment prayer. One shared material, no atlas loading, no black mobile
 * scratches, no repeated shader creation; many bright letters of meadow-light.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite, hash, setInstance } from "../math.js";
import { finishInstanced, markDecorative } from "../decor.js";

const color = new THREE.Color();
const mix = (a, b, t) => a + (b - a) * t;
const shared = { grass: null, flower: null };
const VERT = `
  attribute vec3 instanceColor;
  varying vec2 vUv;
  varying vec3 vColor;
  uniform float awtsTime;
  void main() {
    vUv = uv;
    vColor = instanceColor;
    vec3 p = position;
    float top = smoothstep(0.18, 1.0, uv.y);
    float wave = sin(awtsTime * 1.25 + instanceMatrix[3].x * 0.18 + instanceMatrix[3].z * 0.21);
    p.x += wave * top * 0.045;
    p.z += cos(awtsTime * 0.92 + instanceMatrix[3].x * 0.13) * top * 0.018;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.0);
  }
`;
const FRAG = `
  precision mediump float;
  varying vec2 vUv;
  varying vec3 vColor;
  uniform float awtsFlower;
  void main() {
    float center = abs(vUv.x - 0.5);
    float bladeWidth = mix(0.49, 0.06, smoothstep(0.0, 1.0, vUv.y));
    float bladeAlpha = smoothstep(bladeWidth, bladeWidth - 0.04, center) * smoothstep(0.02, 0.14, vUv.y);
    float flowerShape = smoothstep(0.28, 0.0, length(vUv - vec2(0.5)));
    float alpha = mix(bladeAlpha, flowerShape, awtsFlower);
    if (alpha < 0.18) discard;
    vec3 lightTip = mix(vColor * 0.72, vColor * 1.24, vUv.y);
    vec3 flower = mix(vColor * 0.82, vec3(1.0, 0.92, 0.42), flowerShape * 0.55);
    gl_FragColor = vec4(mix(lightTip, flower, awtsFlower), alpha);
  }
`;

function shaderMaterial(kind = "grass") {
  if (shared[kind]) return shared[kind];
  const material = new THREE.ShaderMaterial({
    uniforms: { awtsTime: { value: 0 }, awtsFlower: { value: kind === "flower" ? 1 : 0 } },
    vertexShader: VERT,
    fragmentShader: FRAG,
    vertexColors: true,
    side: THREE.DoubleSide,
    transparent: false,
    depthWrite: true
  });
  material.name = `awtsmoos_one_time_shader_${kind}`;
  material.userData.worldPersistentAsset = true;
  material.userData.generatedOnceGrassShader = true;
  shared[kind] = material;
  return material;
}
function bladeGeo(height = 0.34, width = 0.045) {
  const geo = new THREE.BufferGeometry();
  const p = [-width, 0, 0, width, 0, 0, width * 0.26, height, 0.012, -width * 0.72, 0, 0.014, width * 0.72, 0, -0.012, -width * 0.08, height * 0.9, 0];
  const uv = [0, 0, 1, 0, 0.56, 1, 0, 0, 1, 0, 0.48, 0.94];
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(p), 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uv), 2));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 1, 2, 3, 4, 5]), 1));
  geo.computeBoundingSphere();
  return geo;
}
function flowerGeo() {
  const geo = new THREE.PlaneGeometry(0.09, 0.09, 1, 1);
  geo.rotateX(-Math.PI / 2);
  return geo;
}
function patchPoint(patch, seed, i) { const a = hash(i, seed, 1) * Math.PI * 2, r = finite(patch.radius, 12) * Math.sqrt(hash(i, seed, 2)); return { x: finite(patch.x) + Math.cos(a) * r, z: finite(patch.z) + Math.sin(a) * r }; }
function choose(patches, seed, i, radius) { return patches.length ? patches[Math.floor(hash(i, seed, 4) * patches.length)] : { x: 0, z: 0, radius }; }
function safeTint(mesh, i, base, alt, seed, warmth = 0) {
  const a = new THREE.Color(base || 0x6fbf55), b = new THREE.Color(alt || 0xa6df70);
  color.setRGB(mix(a.r, b.r, hash(i, seed, 70)), mix(a.g, b.g, hash(i, seed, 71)), mix(a.b, b.b, hash(i, seed, 72)));
  color.offsetHSL((hash(i, seed, 73) - 0.5) * 0.02, 0.08, 0.12 + warmth);
  color.r = Math.max(color.r, 0.18); color.g = Math.max(color.g, 0.38); color.b = Math.max(color.b, 0.12);
  mesh.setColorAt(i, color);
}
function blade(mesh, i, p, y, seed, tall = 1) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((hash(i, seed, 21) - 0.5) * 0.16, hash(i, seed, 2) * Math.PI * 2, (hash(i, seed, 22) - 0.5) * 0.12));
  const s = new THREE.Vector3(0.76 + hash(i, seed, 9) * 0.74, (0.66 + hash(i, seed, 12) * 0.96) * tall, 0.76 + hash(i, seed, 15) * 0.74);
  setInstance(mesh, i, new THREE.Vector3(p.x, y, p.z), q, s);
}
function flower(mesh, i, p, y, seed) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, hash(i, seed, 31) * Math.PI * 2, 0));
  const s = new THREE.Vector3(0.82 + hash(i, seed, 34) * 0.9, 0.82 + hash(i, seed, 35) * 0.9, 1);
  setInstance(mesh, i, new THREE.Vector3(p.x, y + 0.055, p.z), q, s);
}
function makeMesh(geo, material, count, name) { const mesh = new THREE.InstancedMesh(geo, material, Math.max(1, count)); mesh.name = name; mesh.castShadow = false; mesh.receiveShadow = false; mesh.frustumCulled = true; return mesh; }
function tickShader(meshes) { const t = () => (globalThis.performance?.now?.() || Date.now()) * 0.001; meshes.forEach(mesh => { mesh.onBeforeRender = () => { if (mesh.material?.uniforms?.awtsTime) mesh.material.uniforms.awtsTime.value = t(); }; }); }

export function createGrassField(op = {}, heightAt = () => 0) {
  const patches = op.patches || [], count = Math.max(1, Math.floor(finite(op.count, 1400)));
  const tallCount = Math.floor(count * Math.min(finite(op.tallRatio, 0.18), 0.24));
  const flowerCount = Math.floor(count * Math.min(finite(op.flowerRatio, 0.14), 0.18));
  const short = makeMesh(bladeGeo(0.34, 0.045), shaderMaterial("grass"), count, "shader_meadow_short_grass_many_blades");
  const tall = makeMesh(bladeGeo(0.58, 0.038), shaderMaterial("grass"), tallCount, "shader_meadow_tall_grass_swaying_blades");
  const flowers = makeMesh(flowerGeo(), shaderMaterial("flower"), flowerCount, "shader_meadow_procedural_flower_sparks");
  for (let i = 0; i < count; i += 1) { const p = patchPoint(choose(patches, 7, i, finite(op.radius, 60)), 7, i); blade(short, i, p, heightAt(p.x, p.z) + finite(op.groundLift, 0.014), 7, 0.88); safeTint(short, i, 0x68b84b, 0xd5ed71, 7, 0.03); }
  for (let i = 0; i < tallCount; i += 1) { const p = patchPoint(choose(patches, 43, i, finite(op.radius, 60)), 43, i); blade(tall, i, p, heightAt(p.x, p.z) + finite(op.groundLift, 0.016), 43, 1.1); safeTint(tall, i, 0x5fae42, 0xc6e366, 43, 0.03); }
  for (let i = 0; i < flowerCount; i += 1) { const p = patchPoint(choose(patches, 91, i, finite(op.radius, 60)), 91, i); flower(flowers, i, p, heightAt(p.x, p.z) + finite(op.groundLift, 0.02), 91); safeTint(flowers, i, op.flowerColor || 0xffe776, op.flowerAltColor || 0xffb8df, 91, 0.09); }
  finishInstanced([short, tall, flowers]);
  tickShader([short, tall, flowers]);
  const group = new THREE.Group(); group.name = op.name || "AwtsmoosGrassField_one_time_shader_meadow";
  group.add(short, tall, flowers);
  group.traverse(child => Object.assign(child.userData ||= {}, { skipRaycast: true, skipOctree: true, noOctree: true, villageDecor: true, shaderGrass: true }));
  return markDecorative(group);
}
