// B"H
/** @file buildGrassPatch.js @description Deterministic procedural-core tuft grass patch, no random shimmer and no optional parser paths. */
import * as THREE from "/games/scripts/build/three.module.js";
import { createGrassMaterial } from "./shaders/GrassShader.js";
import { NATURE_RULES } from "../data/manifests/NatureRules.js";
import { createGrassFieldMesh } from "/libs/awtsmoos-procedural-core/src/core/geometry/primitives/grass.js";
function propsOf(def) { return def && def.props ? def.props : {}; }
function positionOf(def) { return def && Array.isArray(def.position) ? def.position : [0,0,0]; }
function bindWind(olam, mesh) { if (!olam || !olam.tzimtzum || typeof olam.tzimtzum.onUpdate !== "function") return; const speed = NATURE_RULES.grass.animation.swaySpeed || 1; olam.tzimtzum.onUpdate((t, dt) => { if (mesh.material && mesh.material.uniforms && mesh.material.uniforms.time) mesh.material.uniforms.time.value += dt * speed; }); }
export async function buildGrassPatch(scene, physics, def, olam = null) {
  const props = propsOf(def), count = props.count || 1200, radius = props.radius || 60, seed = props.seed || 770;
  const pos = positionOf(def), data = createGrassFieldMesh({ count, seed, patches:[[0,0,0,radius]], blades:7 });
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(data.positions, 3)); geo.setIndex(data.indices); geo.computeVertexNormals();
  const mesh = new THREE.InstancedMesh(geo, createGrassMaterial(), data.instanceCount); mesh.name = def.id || "deterministic_procedural_core_grass_patch"; mesh.position.set(pos[0] || 0, pos[1] || 0, pos[2] || 0); mesh.frustumCulled = true;
  const dummy = new THREE.Object3D();
  for (let i=0; i<data.instanceCount; i++) { dummy.position.set(data.instanceOffsets[i*3], 0, data.instanceOffsets[i*3+2]); dummy.rotation.set(0, data.instanceRotations[i], 0); dummy.scale.setScalar(data.instanceScales[i]); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix); }
  mesh.instanceMatrix.needsUpdate = true; bindWind(olam, mesh); return [mesh];
}
