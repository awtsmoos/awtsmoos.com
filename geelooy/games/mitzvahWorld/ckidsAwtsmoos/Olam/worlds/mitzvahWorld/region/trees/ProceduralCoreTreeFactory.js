// B"H
/** @file ProceduralCoreTreeFactory.js @description Optimized procedural-core trees with fuller branch/leaf profiles. */
import * as THREE from "/games/scripts/build/three.module.js";
import { TreeGenerator } from "/libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeGenerator.js";
import { createAwtsmoosThreeBufferGeometry } from "/libs/awtsmoos-procedural-core/src/adapters/three/bufferGeometry.js";
import { materialWithTexture } from "../../materials/ProceduralTextureKit.js?v=awtsmoos-texture-kit-20260614-bh2";

const GEOMETRIES = new Map();
const MATERIALS = new Map();

function config(kind, seed) {
  const pine = kind === "pine";
  const apple = kind === "apple";
  const willow = kind === "willow";
  return {
    seed,
    type:pine ? "evergreen" : "deciduous",
    branch:{
      levels:pine ? 4 : 3,
      children:{ 0:pine ? 11 : willow ? 8 : 7, 1:pine ? 8 : 6, 2:pine ? 7 : 6, 3:pine ? 5 : 0 },
      force:{ direction:{ x:0, y:pine ? .24 : willow ? .18 : .44, z:0 }, strength:pine ? .052 : .04 },
      gnarliness:{ 0:pine ? .05 : .10, 1:pine ? .18 : .25, 2:pine ? .34 : .44, 3:.28 },
      length:{ 0:apple ? 6.4 : pine ? 9.2 : 8.6, 1:pine ? 4.4 : 4.7, 2:pine ? 2.6 : 2.25, 3:pine ? 1.25 : .8 },
      radius:{ 0:apple ? .74 : pine ? .88 : .84, 1:pine ? .32 : .30, 2:pine ? .12 : .10, 3:pine ? .045 : .035 },
      sections:{ 0:pine ? 12 : 10, 1:pine ? 8 : 7, 2:pine ? 5 : 4, 3:3 },
      segments:{ 0:pine ? 13 : 11, 1:pine ? 9 : 7, 2:pine ? 6 : 5, 3:4 },
      start:{ 0:.11, 1:.08, 2:.055, 3:.04 },
      taper:{ 0:pine ? .50 : .55, 1:pine ? .70 : .76, 2:pine ? .86 : .92, 3:.96 },
      angle:{ 0:pine ? 74 : willow ? 48 : 39, 1:pine ? 66 : 52, 2:pine ? 58 : 70, 3:pine ? 48 : 64 }
    },
    leaves:{
      count:pine ? 28 : apple ? 18 : willow ? 22 : 16,
      size:pine ? .34 : apple ? .60 : willow ? .42 : .52,
      tint:pine ? [.07,.40,.15,1] : apple ? [.36,.68,.16,1] : willow ? [.20,.62,.20,1] : [.20,.60,.15,1]
    }
  };
}

function leafTexture() {
  if (MATERIALS.has("leafTexture")) return MATERIALS.get("leafTexture");
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / (size - 1) * 2 - 1;
      const v = y / (size - 1) * 2 - 1;
      const edge = Math.abs(u) / Math.max(.08, Math.sin((v + 1) * Math.PI * .5));
      const serration = Math.sin((v + 1) * 38) * .045;
      const inside = edge < .88 + serration && Math.abs(v) < .96;
      const vein = Math.max(0, 1 - Math.abs(u) * 26) * .34;
      const grain = ((x * 17 + y * 31) % 23) / 23;
      const i = (y * size + x) * 4;
      data[i] = 45 + grain * 35 + vein * 70;
      data[i + 1] = 112 + grain * 70 + vein * 52;
      data[i + 2] = 28 + grain * 22;
      data[i + 3] = inside ? 255 : 0;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  texture.userData ||= {};
  texture.userData.pingPongRepeat = true;
  MATERIALS.set("leafTexture", texture);
  return texture;
}

function geometries(kind, variant) {
  const key = `${kind}:${variant}`;
  if (GEOMETRIES.has(key)) return GEOMETRIES.get(key);
  const output = new TreeGenerator(config(kind, 711 + variant * 97 + kind.length * 13)).generate();
  const branches = createAwtsmoosThreeBufferGeometry(THREE, {
    positions:output.branches.verts,
    normals:output.branches.normals,
    uvs:output.branches.uvs,
    indices:output.branches.indices
  });
  const leaves = createAwtsmoosThreeBufferGeometry(THREE, {
    positions:output.leaves.verts,
    normals:output.leaves.normals,
    uvs:output.leaves.uvs,
    colors:output.leaves.colors,
    indices:output.leaves.indices
  });
  const pair = { branches, leaves };
  GEOMETRIES.set(key, pair);
  return pair;
}

function materials(kind) {
  if (MATERIALS.has(kind)) return MATERIALS.get(kind);
  const bark = materialWithTexture("wood", { size:256 });
  const leaves = new THREE.MeshLambertMaterial({ map:leafTexture(), color:0xffffff, vertexColors:true, alphaTest:.34, side:THREE.DoubleSide });
  const wind = { value:0 };
  leaves.onBeforeCompile = shader => {
    shader.uniforms.awtsWind = wind;
    shader.vertexShader = `uniform float awtsWind;\nvarying float vLeafNoise;\n${shader.vertexShader}`
      .replace("#include <begin_vertex>", `vec3 transformed=vec3(position); float crown=smoothstep(1.3,9.0,position.y); vLeafNoise=fract(sin(dot(position.xz,vec2(12.9898,78.233))+position.y*4.13)*43758.5453); transformed.x+=sin(awtsWind*1.25+position.y*.9+position.z*.4)*.09*crown; transformed.z+=cos(awtsWind*.9+position.x*.5)*.035*crown;`)
      .replace("#include <color_vertex>", `#include <color_vertex>\n#ifdef USE_COLOR\nvColor.rgb *= mix(vec3(.74,.90,.70),vec3(1.20,1.12,.78),vLeafNoise);\n#endif`);
    shader.fragmentShader = `varying float vLeafNoise;\n${shader.fragmentShader}`
      .replace("#include <dithering_fragment>", `gl_FragColor.rgb *= 0.88 + vLeafNoise * 0.20;\n#include <dithering_fragment>`);
  };
  leaves.userData.windUniform = wind;
  const pair = { bark, leaves };
  MATERIALS.set(kind, pair);
  return pair;
}

export function createProceduralCoreTree(kind = "oak", variant = 0) {
  const group = new THREE.Group();
  const geometry = geometries(kind, variant % 4);
  const material = materials(kind);
  const branches = new THREE.Mesh(geometry.branches, material.bark);
  const leaves = new THREE.Mesh(geometry.leaves, material.leaves);
  branches.name = "procedural_core_tree_branches";
  leaves.name = "procedural_core_cutout_leaf_canopy";
  leaves.receiveShadow = false;
  branches.receiveShadow = false;
  branches.castShadow = false;
  leaves.castShadow = false;
  group.add(branches, leaves);
  Object.assign(group.userData, {
    proceduralCoreTree:true,
    treeKind:kind,
    windUniform:material.leaves.userData.windUniform,
    fullerProceduralCoreTree:true,
    generatorPath:"/libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeGenerator.js"
  });
  return group;
}

export function advanceProceduralTreeWind(root, dt) {
  const uniforms = new Set();
  if (root && typeof root.traverse === "function") {
    root.traverse(node => {
      const data = node.userData || {};
      if (data.windUniform) uniforms.add(data.windUniform);
    });
  }
  uniforms.forEach(uniform => {
    uniform.value += Math.min(.05, Math.max(.001, Number(dt) || 1 / 60));
  });
}
