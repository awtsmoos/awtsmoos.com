// B"H
/**
 * @file ProceduralCoreGrassField.js
 * @description Instanced grass with a mobile-safe bright shader. The earlier
 * root-heavy color ramp made dense grass read as black spikes on phones. This
 * shader keeps player bending and wind, but normalizes blade height and uses a
 * green ramp with no near-black colors.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { groundY } from "./RegionGround.js";
import { roadMask } from "../../postbuild/VillagePolishGround.js?v=awtsmoos-polish-ground-20260614-bh2";
import { pointInGrassExclusion } from "./RegionGrassExclusion.js";

function rand(seed, salt = 0) {
  return Math.abs(Math.sin((seed + 1) * 12.9898 + salt * 78.233) * 43758.5453) % 1;
}

function shaderMaterial() {
  const uniforms = {
    time:{ value:0 },
    playerPosition:{ value:new THREE.Vector3(9999, 0, 9999) },
    bendRadius:{ value:2.8 },
    bendStrength:{ value:.18 }
  };
  const material = new THREE.ShaderMaterial({
    side:THREE.DoubleSide,
    transparent:false,
    depthWrite:true,
    depthTest:true,
    toneMapped:false,
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
      varying float vBladeNoise;
      void main() {
        vec3 p = position;
        float normalizedHeight = clamp(position.y / 0.42, 0.0, 1.0);
        p.xz *= instanceScale;
        p.y *= min(instanceScale, 0.82);
        float c = cos(instanceRotation);
        float s = sin(instanceRotation);
        p.xz = mat2(c, -s, s, c) * p.xz;
        vec3 world = p + instanceOffset;
        float d = distance(world.xz, playerPosition.xz);
        float push = smoothstep(bendRadius, 0.0, d) * bendStrength * normalizedHeight * instanceBend;
        vec2 away = normalize(world.xz - playerPosition.xz + vec2(0.001));
        world.xz += away * push;
        world.x += sin(time * 1.4 + instanceOffset.x * 0.05 + instanceOffset.z * 0.04) * 0.028 * normalizedHeight;
        world.z += cos(time * 1.1 + instanceOffset.x * 0.035) * 0.014 * normalizedHeight;
        vHeight = normalizedHeight;
        vTint = instanceTint;
        vBladeNoise = fract(sin(dot(instanceOffset.xz, vec2(12.9898, 78.233))) * 43758.5453);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
      }
    `,
    fragmentShader:`
      precision mediump float;
      varying float vHeight;
      varying float vTint;
      varying float vBladeNoise;
      void main() {
        vec3 root = vec3(0.20, 0.55, 0.12);
        vec3 leaf = vec3(0.42, 0.82, 0.21);
        vec3 tip = vec3(0.76, 0.96, 0.34);
        vec3 clover = vec3(0.28, 0.72, 0.20);
        vec3 dry = vec3(0.62, 0.58, 0.24);
        float stripe = step(0.58, fract(vBladeNoise * 19.0 + vHeight * 3.2));
        vec3 color = mix(root, leaf, smoothstep(0.0, 0.72, vHeight));
        color = mix(color, tip, smoothstep(0.70, 1.0, vHeight) * 0.50);
        color = mix(color, clover, smoothstep(0.22, 0.86, vBladeNoise) * 0.18);
        color = mix(color, dry, smoothstep(0.78, 1.0, vTint) * 0.16);
        color *= 1.02 + stripe * 0.10 + vBladeNoise * 0.05;
        gl_FragColor = vec4(max(color, vec3(0.16, 0.42, 0.08)), 1.0);
      }
    `
  });
  material.userData.uniforms = uniforms;
  material.userData.awtsmoosGrassShader = true;
  material.userData.mobileBrightGrass = true;
  material.onBeforeCompile = shader => {
    material.userData.compiledUniforms = Object.keys(shader.uniforms || {});
  };
  return material;
}

function tuftGeometryData() {
  const w = .05;
  const h = .36;
  return {
    verts:[
      -w,0,0, w,0,0, w,h,0, -w,h,0,
      0,0,-w, 0,0,w, 0,h,w, 0,h,-w,
      -w*.72,0,-w*.72, w*.72,0,w*.72, w*.72,h*.82,w*.72, -w*.72,h*.82,-w*.72
    ],
    idx:[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11]
  };
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

function patchesFromSpecs(specs) {
  return specs.length ? specs.slice(0, 900).map(s => [Number(s.x) || 0, Number(s.z) || 0, 5.8]) : [[-70, 30, 240], [105, -35, 150]];
}

function samplePatch(patches, i) {
  const p = patches[i % patches.length];
  const angle = rand(i, 11) * Math.PI * 2;
  const r = Math.sqrt(rand(i, 12)) * p[2];
  return { x:p[0] + Math.cos(angle) * r, z:p[1] + Math.sin(angle) * r * .55 };
}

export function createProceduralCoreGrassField(olam, specs = [], count = 3600, options = {}) {
  const patches = patchesFromSpecs(specs);
  const exclusions = options.exclusions || [];
  const offsets = [];
  const scales = [];
  const rotations = [];
  const tints = [];
  const bends = [];
  let rejectedRoad = 0;
  let rejectedVillage = 0;
  let tries = 0;
  const target = Math.min(Math.max(360, Math.floor(count)), 4200);
  const maxTries = target * 4;
  while (scales.length < target && tries < maxTries) {
    const i = tries++;
    const p = samplePatch(patches, i);
    const x = p.x;
    const z = p.z;
    if (roadMask(x, z, 7) > .5) {
      rejectedRoad++;
      continue;
    }
    if (pointInGrassExclusion(x, z, exclusions)) {
      rejectedVillage++;
      continue;
    }
    offsets.push(x, groundY(olam, x, z) + .014, z);
    scales.push(.66 + rand(i, 21) * .36);
    rotations.push(rand(i, 22) * Math.PI * 2);
    tints.push(rand(i, 23));
    bends.push(.45 + rand(i, 24) * .55);
  }
  const geometry = addAttrs(new THREE.InstancedBufferGeometry(), tuftGeometryData(), offsets, scales, rotations, tints, bends);
  const material = shaderMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "living_shader_bright_green_tuft_grass_mobile_safe";
  mesh.frustumCulled = false;
  mesh.receiveShadow = false;
  mesh.castShadow = false;
  mesh.userData = {
    olam,
    stats:{
      grassTufts:scales.length,
      drawCalls:1,
      playerReactive:true,
      proceduralCore:true,
      mobileSafeGrass:true,
      blackSpikeSafe:true,
      brightGreenGrass:true,
      shaderGrass:true,
      patches:patches.length,
      exclusions:exclusions.length,
      rejectedRoad,
      rejectedVillage
    }
  };
  return mesh;
}

export function advanceProceduralGrass(mesh, dt) {
  const u = mesh?.material?.userData?.uniforms;
  if (!u) return;
  u.time.value += Math.min(.05, Math.max(.001, Number(dt) || 1 / 60));
  const olam = mesh.userData?.olam;
  const p = olam?.player?.mesh?.position || olam?.chossid?.mesh?.position;
  if (p) u.playerPosition.value.copy(p);
}
