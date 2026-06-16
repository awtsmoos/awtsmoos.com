// B"H
/**
 * @file buildTerrain.js
 * @description Ground mesh with shader patch masks, static collider, and parser-clear props.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { createGroundMixMaterial } from "./shaders/GroundMixShader.js?v=awtsmoos-ground-mix-20260614-bh2";
function propsOf(def) { return def && def.props ? def.props : {}; }
function triple(value, fallback) { return Array.isArray(value) ? value : fallback; }
function physicsDef(props) { return props && props.physics ? props.physics : null; }
function colorFrom(props, key, fallback) { return new THREE.Color(props && props[key] !== undefined ? props[key] : fallback); }
function addStaticBox(physics, x, y, z, hx, hy, hz) {
  try {
    if (physics && typeof physics.addStaticBox === "function") physics.addStaticBox({ x, y, z }, { hx, hy, hz });
    else if (physics && physics.world && typeof physics.world.createRigidBody === "function" && physics.RAPIER) { const R = physics.RAPIER; const bodyDesc = R.RigidBodyDesc.fixed().setTranslation(x, y, z); const body = physics.world.createRigidBody(bodyDesc); physics.world.createCollider(R.ColliderDesc.cuboid(hx, hy, hz), body); }
    else console.warn("B\"H - buildTerrain: physics API not recognized, skipping collider for terrain.");
  } catch (error) { console.error("B\"H - buildTerrain: physics error →", error); }
}
export async function buildTerrain(scene, physics, def, olam = null) {
  const props = propsOf(def), width = props.width || 200, depth = props.depth || 200, receiveShadow = props.receiveShadow !== false;
  const position = triple(def.position, [0,0,0]);
  const geo = new THREE.PlaneGeometry(width, depth, 32, 32); geo.rotateX(-Math.PI / 2);
  const mat = createGroundMixMaterial({ dirtColor:colorFrom(props, "dirtColor", 0x5d4037), grassColor:colorFrom(props, "grassColor", 0x2e7d32), scale:props.shaderScale || .05, grassPatches:props.grassPatches || [] });
  const mesh = new THREE.Mesh(geo, mat); mesh.position.set(position[0], position[1], position[2]); mesh.receiveShadow = receiveShadow; mesh.name = def.id || "terrain"; mesh.userData.isSolid = true;
  const phys = physicsDef(props); if (physics && phys) { const half = triple(phys.halfExtents, [width/2, .5, depth/2]); addStaticBox(physics, position[0], position[1] - half[1], position[2], half[0], half[1], half[2]); }
  return [mesh];
}
