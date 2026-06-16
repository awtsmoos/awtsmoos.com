// B"H
/**
 * @file ProceduralCoreGrassField.js
 * @description Shader grass kept alive, but the shader vessel is declared in
 * full. Android saw the old single-line shader without explicit uniform
 * declarations and cried that time/playerPosition/bendRadius/bendStrength were
 * hidden. Now the living grass keeps wind and player-bending while compiling as
 * lawful GLSL, with a solid material fallback only if the GPU refuses it.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { groundY } from "./RegionGround.js";
import { roadMask } from "../../postbuild/VillagePolishGround.js?v=awtsmoos-polish-ground-20260614-bh2";
import { pointInGrassExclusion } from "./RegionGrassExclusion.js";
function rand(seed, salt = 0) { return Math.abs(Math.sin((seed + 1) * 12.9898 + salt * 78.233) * 43758.5453) % 1; }
function shaderMaterial() {
  const uniforms = { time:{ value:0 }, playerPosition:{ value:new THREE.Vector3(9999, 0, 9999) }, bendRadius:{ value:2.8 }, bendStrength:{ value:.2 } };
  const material = new THREE.ShaderMaterial({
    side:THREE.DoubleSide,
    transparent:false,
    depthWrite:true,
    uniforms,
    vertexShader:`
      precision mediump float;
      uniform float time;
      uniform vec3 playerPosition;
      uniform float bendRadius;
      uniform float bendStrength;
      attribute vec3 instanceOffset;
      attribute float instanceScale;
      attribute float instanceRotation;
      attribute float instanceTint;
      attribute float instanceBend;
      varying float vHeight;
      varying float vTint;
      void main() {
        vec3 p = position;
        p.xz *= instanceScale;
        p.y *= min(instanceScale, 0.72);
        float c = cos(instanceRotation);
        float s = sin(instanceRotation);
        p.xz = mat2(c, -s, s, c) * p.xz;
        vec3 world = p + instanceOffset;
        float d = distance(world.xz, playerPosition.xz);
        float push = smoothstep(bendRadius, 0.0, d) * bendStrength * p.y * instanceBend;
        vec2 away = normalize(world.xz - playerPosition.xz + vec2(0.001));
        world.xz += away * push;
        world.x += sin(time * 1.4 + instanceOffset.x * 0.05 + instanceOffset.z * 0.04) * 0.025 * p.y;
        vHeight = clamp(position.y, 0.0, 1.0);
        vTint = instanceTint;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
      }
    `,
    fragmentShader:`
      precision mediump float;
      varying float vHeight;
      varying float vTint;
      void main() {
        vec3 low = vec3(0.12, 0.42, 0.10);
        vec3 high = vec3(0.48, 0.86, 0.24);
        vec3 warm = vec3(0.34, 0.72, 0.18);
        vec3 color = mix(low, high, smoothstep(0.0, 1.0, vHeight));
        color = mix(color, warm, vTint * 0.35);
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  material.userData.uniforms = uniforms;
  material.userData.awtsmoosGrassShader = true;
  material.onBeforeCompile = shader => { material.userData.compiledUniforms = Object.keys(shader.uniforms || {}); };
  return material;
}
function fallbackMaterial() { const m = new THREE.MeshLambertMaterial({ color:0x42b83d, side:THREE.DoubleSide }); m.userData.awtsmoosGrassFallback = true; return m; }
function tuftGeometryData() {
  const w = .055, h = .42;
  return { verts:[-w,0,0,w,0,0,w,h,0,-w,h,0,0,0,-w,0,0,w,0,h,w,0,h,-w,-w*.72,0,-w*.72,w*.72,0,w*.72,w*.72,h*.82,w*.72,-w*.72,h*.82,-w*.72], idx:[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11] };
}
function addAttrs(g, base, offsets, scales, rotations, tints, bends) {
  g.setAttribute("position", new THREE.Float32BufferAttribute(base.verts, 3));
  g.setIndex(base.idx);
  g.setAttribute("instanceOffset", new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
  g.setAttribute("instanceScale", new THREE.InstancedBufferAttribute(new Float32Array(scales), 1));
  g.setAttribute("instanceRotation", new THREE.InstancedBufferAttribute(new Float32Array(rotations), 1));
  g.setAttribute("instanceTint", new THREE.InstancedBufferAttribute(new Float32Array(tints), 1));
  g.setAttribute("instanceBend", new THREE.InstancedBufferAttribute(new Float32Array(bends), 1));
  g.instanceCount = scales.length;
  g.computeBoundingSphere();
  return g;
}
function patchesFromSpecs(specs) { return specs.length ? specs.slice(0, 900).map(s => [Number(s.x) || 0, Number(s.z) || 0, 5.8]) : [[-70, 30, 240], [105, -35, 150]]; }
function samplePatch(patches, i) { const p = patches[i % patches.length], angle = rand(i, 11) * Math.PI * 2, r = Math.sqrt(rand(i, 12)) * p[2]; return { x:p[0] + Math.cos(angle) * r, z:p[1] + Math.sin(angle) * r * .55 }; }
export function createProceduralCoreGrassField(olam, specs = [], count = 22000, options = {}) {
  const patches = patchesFromSpecs(specs), exclusions = options.exclusions || [], offsets = [], scales = [], rotations = [], tints = [], bends = [];
  let rejectedRoad = 0, rejectedVillage = 0, tries = 0;
  const target = Math.min(Math.max(1200, Math.floor(count)), 22000), maxTries = target * 4;
  while (scales.length < target && tries < maxTries) {
    const i = tries++, p = samplePatch(patches, i), x = p.x, z = p.z;
    if (roadMask(x, z, 7) > .5) { rejectedRoad++; continue; }
    if (pointInGrassExclusion(x, z, exclusions)) { rejectedVillage++; continue; }
    offsets.push(x, groundY(olam, x, z) + .015, z);
    scales.push(.62 + rand(i, 21) * .42);
    rotations.push(rand(i, 22) * Math.PI * 2);
    tints.push(rand(i, 23));
    bends.push(.45 + rand(i, 24) * .55);
  }
  const geometry = addAttrs(new THREE.InstancedBufferGeometry(), tuftGeometryData(), offsets, scales, rotations, tints, bends);
  const material = options.forceFallbackMaterial ? fallbackMaterial() : shaderMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "living_shader_short_green_tuft_grass";
  mesh.frustumCulled = false;
  mesh.receiveShadow = false;
  mesh.castShadow = false;
  mesh.userData = { olam, stats:{ grassTufts:scales.length, drawCalls:1, playerReactive:true, proceduralCore:true, mobileSafeGrass:true, blackSpikeSafe:true, shaderGrass:true, shaderFallbackAvailable:true, patches:patches.length, exclusions:exclusions.length, rejectedRoad, rejectedVillage } };
  return mesh;
}
export function advanceProceduralGrass(mesh, dt) { const u = mesh?.material?.userData?.uniforms; if (!u) return; u.time.value += Math.min(.05, Math.max(.001, Number(dt) || 1 / 60)); const olam = mesh.userData?.olam, p = olam?.player?.mesh?.position || olam?.chossid?.mesh?.position; if (p) u.playerPosition.value.copy(p); }
