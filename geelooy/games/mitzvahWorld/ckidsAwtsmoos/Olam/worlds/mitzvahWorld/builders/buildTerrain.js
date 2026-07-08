// B"H
/**
 * @file buildTerrain.js
 * @description Terrain is not a guess. It is the mesh that feet must answer to.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createGroundMixMaterial } from "./shaders/GroundMixShader.js?compact=true&v=awtsmoos-ground-mix-20260614-bh2";
import { registerGroundMesh as registerMeshGroundAuthority } from "../collision/GroundCollisionWorld.js?compact=true&v=inline-octree-no-worker-import-20260702-bh1";

const fallbackTriple = (value, fallback) => Array.isArray(value) ? value : fallback;
const propsOf = def => def?.props || {};
const colorFrom = (props, key, fallback) => new THREE.Color(props?.[key] ?? fallback);

function addStaticBox(physics, x, y, z, hx, hy, hz) {
  try {
    if (typeof physics?.addStaticBox === "function") return physics.addStaticBox({ x, y, z }, { hx, hy, hz });
    if (physics?.world?.createRigidBody && physics.RAPIER) {
      const R = physics.RAPIER;
      const body = physics.world.createRigidBody(R.RigidBodyDesc.fixed().setTranslation(x, y, z));
      physics.world.createCollider(R.ColliderDesc.cuboid(hx, hy, hz), body);
    }
  } catch (error) { console.error("B\"H - buildTerrain physics fallback failed", error); }
}

function markMeshAsGround(mesh, def) {
  mesh.userData ||= {};
  Object.assign(mesh.userData, {
    isSolid:true,
    isTerrain:true,
    awtsmoosGroundCollider:true,
    awtsmoosMeshGroundAuthority:true,
    skipRaycast:false,
    terrainColliderKind:"visual-mesh-raycast",
    terrainId:def?.id || mesh.name || "terrain"
  });
  mesh.raycast ||= THREE.Mesh.prototype.raycast;
}

function registerGroundMesh(olam, mesh) {
  if (!olam || !mesh) return;
  olam.__awtsmoosGroundCollisionMeshes ||= [];
  if (!olam.__awtsmoosGroundCollisionMeshes.includes(mesh)) olam.__awtsmoosGroundCollisionMeshes.push(mesh);
  registerMeshGroundAuthority(olam, mesh);
  try { olam.worldOctree?.addObject?.(mesh); } catch {}
  try { olam.worldOctree?.addMesh?.(mesh); } catch {}
}

export async function buildTerrain(scene, physics, def, olam = null) {
  const props = propsOf(def);
  const width = props.width || 200, depth = props.depth || 200;
  const position = fallbackTriple(def?.position, [0, 0, 0]);
  const geo = new THREE.PlaneGeometry(width, depth, props.segmentsX || 64, props.segmentsZ || 64);
  geo.rotateX(-Math.PI / 2);
  geo.computeBoundingBox?.();
  geo.computeBoundingSphere?.();
  const mat = createGroundMixMaterial({
    dirtColor:colorFrom(props, "dirtColor", 0x5d4037),
    grassColor:colorFrom(props, "grassColor", 0x2e7d32),
    scale:props.shaderScale || .05,
    grassPatches:props.grassPatches || []
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = def?.id || "terrain";
  mesh.position.set(position[0], position[1], position[2]);
  mesh.receiveShadow = props.receiveShadow !== false;
  markMeshAsGround(mesh, def);
  mesh.updateMatrixWorld?.(true);
  registerGroundMesh(olam, mesh);
  const phys = props.physics;
  if (physics && phys) {
    const half = fallbackTriple(phys.halfExtents, [width / 2, .5, depth / 2]);
    addStaticBox(physics, position[0], position[1] - half[1], position[2], half[0], half[1], half[2]);
  }
  return [mesh];
}
