// B"H
/** @file ProceduralCoreTreeFactory.js @description Optimized procedural-core trees with cutout grain leaves and parser-clear wind. */
import * as THREE from "/games/scripts/build/three.module.js";
import { TreeGenerator } from "/libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeGenerator.js";
import { createAwtsmoosThreeBufferGeometry } from "/libs/awtsmoos-procedural-core/src/adapters/three/bufferGeometry.js";
import { materialWithTexture } from "../../materials/ProceduralTextureKit.js?v=awtsmoos-texture-kit-20260614-bh2";
const GEOMETRIES = new Map(), MATERIALS = new Map();
function config(kind, seed) {
  const pine = kind === "pine", apple = kind === "apple";
  return { seed, type:pine ? "evergreen" : "deciduous", branch:{ levels:3, children:{ 0:pine ? 7 : 6, 1:5, 2:6 }, force:{ direction:{ x:0, y:pine ? .18 : .42, z:0 }, strength:.035 }, gnarliness:{ 0:.08, 1:.24, 2:.42 }, length:{ 0:apple ? 6.2 : 8.4, 1:pine ? 3.4 : 4.2, 2:2.1, 3:.8 }, radius:{ 0:apple ? .72 : .82, 1:.28, 2:.095, 3:.035 }, sections:{ 0:9, 1:6, 2:4, 3:2 }, segments:{ 0:10, 1:7, 2:5, 3:3 }, start:{ 0:.12, 1:.09, 2:.06 }, taper:{ 0:.55, 1:.76, 2:.92, 3:1 }, angle:{ 0:pine ? 68 : 38, 1:pine ? 62 : 51, 2:70 } }, leaves:{ count:pine ? 5 : 7, size:pine ? .36 : apple ? .56 : .48, tint:pine ? [.08,.38,.14,1] : apple ? [.34,.66,.16,1] : [.18,.58,.14,1] } };
}
function leafTexture() {
  if (MATERIALS.has("leafTexture")) return MATERIALS.get("leafTexture");
  const size = 128, data = new Uint8Array(size * size * 4);
  for (let y=0; y<size; y++) for (let x=0; x<size; x++) { const u=x/(size-1)*2-1, v=y/(size-1)*2-1; const edge=Math.abs(u)/Math.max(.08, Math.sin((v+1)*Math.PI*.5)); const serration=Math.sin((v+1)*38)*.045; const inside=edge<.88+serration && Math.abs(v)<.96; const vein=Math.max(0,1-Math.abs(u)*26)*.34; const grain=((x*17+y*31)%23)/23; const i=(y*size+x)*4; data[i]=45+grain*35+vein*70; data[i+1]=112+grain*70+vein*52; data[i+2]=28+grain*22; data[i+3]=inside ? 255 : 0; }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat); texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearMipmapLinearFilter; texture.generateMipmaps = true; texture.needsUpdate = true; MATERIALS.set("leafTexture", texture); return texture;
}
function geometries(kind, variant) {
  const key = `${kind}:${variant}`; if (GEOMETRIES.has(key)) return GEOMETRIES.get(key);
  const output = new TreeGenerator(config(kind, 711 + variant * 97 + kind.length * 13)).generate();
  const branches = createAwtsmoosThreeBufferGeometry(THREE, { positions:output.branches.verts, normals:output.branches.normals, uvs:output.branches.uvs, indices:output.branches.indices });
  const leaves = createAwtsmoosThreeBufferGeometry(THREE, { positions:output.leaves.verts, normals:output.leaves.normals, uvs:output.leaves.uvs, colors:output.leaves.colors, indices:output.leaves.indices });
  const pair = { branches, leaves }; GEOMETRIES.set(key, pair); return pair;
}
function materials(kind) {
  if (MATERIALS.has(kind)) return MATERIALS.get(kind);
  const bark = materialWithTexture("wood", { size:256 });
  const leaves = new THREE.MeshLambertMaterial({ map:leafTexture(), color:0xffffff, vertexColors:true, alphaTest:.38, side:THREE.DoubleSide });
  const wind = { value:0 };
  leaves.onBeforeCompile = shader => { shader.uniforms.awtsWind = wind; shader.vertexShader = `uniform float awtsWind;\nvarying float vLeafNoise;\n${shader.vertexShader}`.replace("#include <begin_vertex>", `vec3 transformed=vec3(position); float crown=smoothstep(2.0,8.0,position.y); vLeafNoise=fract(sin(dot(position.xz,vec2(12.9898,78.233))+position.y*4.13)*43758.5453); transformed.x+=sin(awtsWind*1.25+position.y*.9+position.z*.4)*.08*crown;`).replace("#include <color_vertex>", `#include <color_vertex>\n#ifdef USE_COLOR\nvColor.rgb *= mix(vec3(.72,.88,.70),vec3(1.18,1.10,.78),vLeafNoise);\n#endif`); shader.fragmentShader = `varying float vLeafNoise;\n${shader.fragmentShader}`.replace("#include <dithering_fragment>", `gl_FragColor.rgb *= 0.86 + vLeafNoise * 0.22;\n#include <dithering_fragment>`); };
  leaves.userData.windUniform = wind; const pair = { bark, leaves }; MATERIALS.set(kind, pair); return pair;
}
export function createProceduralCoreTree(kind = "oak", variant = 0) {
  const group = new THREE.Group(), geometry = geometries(kind, variant % 4), material = materials(kind);
  const branches = new THREE.Mesh(geometry.branches, material.bark), leaves = new THREE.Mesh(geometry.leaves, material.leaves);
  branches.name = "procedural_core_tree_branches"; leaves.name = "procedural_core_cutout_leaf_canopy"; leaves.receiveShadow = false; branches.receiveShadow = false; branches.castShadow = false; leaves.castShadow = false; group.add(branches, leaves);
  Object.assign(group.userData, { proceduralCoreTree:true, treeKind:kind, windUniform:material.leaves.userData.windUniform }); return group;
}
export function advanceProceduralTreeWind(root, dt) {
  const uniforms = new Set();
  if (root && typeof root.traverse === "function") root.traverse(node => { const data = node.userData || {}; if (data.windUniform) uniforms.add(data.windUniform); });
  uniforms.forEach(uniform => { uniform.value += Math.min(.05, Math.max(.001, Number(dt) || 1 / 60)); });
}
