// B"H
/**
 * @file buildTerrain.js
 * @description Plain visible grass terrain registered as walkable ground authority.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import TerrainMaterialScribe from "../../../../dvarim/terrain/core/TerrainMaterialScribe.js?compact=true&v=terrain-unstretched-repeat-20260709-bh11";
import { registerGroundMesh as registerMeshGroundAuthority } from "../collision/GroundCollisionWorld.js?compact=true&v=inline-octree-no-worker-import-20260702-bh1";
const fallbackTriple = (value, fallback) => Array.isArray(value) ? value : fallback;
const propsOf = def => def?.props || {};
const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
function addStaticBox(physics, x, y, z, hx, hy, hz) {
  if (typeof physics?.addStaticBox === "function") return physics.addStaticBox(x, y, z, hx, hy, hz);
  const RAPIER = physics?.RAPIER || globalThis.RAPIER;
  if (!RAPIER || typeof physics?.createRigidBody !== "function") return null;
  const bodyDesc = RAPIER.RigidBodyDesc?.fixed?.().setTranslation?.(x, y, z);
  const body = physics.createRigidBody(bodyDesc);
  physics.createCollider?.(RAPIER.ColliderDesc.cuboid(hx, hy, hz), body);
  return body;
}
function markMeshAsGround(mesh, def) {
  Object.assign(mesh.userData, {
    isSolid:false,
    isTerrain:true,
    awtsmoosGroundCollider:true,
    awtsmoosMeshGroundAuthority:true,
    walkableTerrain:true,
    skipOctree:true,
    noOctree:true,
    addToOctree:false,
    skipRaycast:false,
    terrainColliderKind:"ground-authority-raycast",
    terrainId:def?.id || mesh.name || "terrain",
    plainGrassDiffuse:true,
    noCustomShader:true
  });
  mesh.raycast ||= THREE.Mesh.prototype.raycast;
}
function registerGroundMesh(olam, mesh) {
  if (!olam || !mesh) return;
  olam.__awtsmoosGroundCollisionMeshes ||= [];
  if (!olam.__awtsmoosGroundCollisionMeshes.includes(mesh)) olam.__awtsmoosGroundCollisionMeshes.push(mesh);
  registerMeshGroundAuthority(olam, mesh);
  olam.__awtsmoosTerrainVisualMesh = mesh;
  olam.__awtsmoosTerrainGroundAuthority = { at:Date.now(), name:mesh.name, skipGlobalOctree:true, source:"buildTerrain-plain-grass" };
}
async function plainGrassMaterial(props, width, depth) {
  return TerrainMaterialScribe.scribe({
    width,
    depth,
    textureTileSize:finite(props.textureTileSize ?? props.tileSize ?? props.grassTileSize, 6)
  });
}
export async function buildTerrain(scene, physics, def, olam = null) {
  const props = propsOf(def), width = finite(props.width, 200), depth = finite(props.depth, 200);
  const position = fallbackTriple(def?.position, [0, 0, 0]);
  const geo = new THREE.PlaneGeometry(width, depth, finite(props.segmentsX, 96), finite(props.segmentsZ, 96));
  geo.rotateX(-Math.PI / 2);
  geo.computeBoundingBox?.();
  geo.computeBoundingSphere?.();
  const mesh = new THREE.Mesh(geo, await plainGrassMaterial(props, width, depth));
  mesh.name = def?.id || "terrain_ground";
  mesh.position.set(finite(position[0], 0), finite(position[1], 0), finite(position[2], 0));
  mesh.receiveShadow = props.receiveShadow !== false;
  mesh.frustumCulled = false;
  mesh.renderOrder = Number.isFinite(Number(props.renderOrder)) ? Number(props.renderOrder) : -20;
  markMeshAsGround(mesh, def);
  mesh.updateMatrixWorld?.(true);
  registerGroundMesh(olam, mesh);
  const phys = props.physics;
  if (physics && phys) {
    const half = fallbackTriple(phys.halfExtents, [width / 2, 0.5, depth / 2]);
    addStaticBox(physics, mesh.position.x, mesh.position.y - finite(half[1], 0.5), mesh.position.z, finite(half[0], width / 2), finite(half[1], 0.5), finite(half[2], depth / 2));
  }
  globalThis.__AWTSMOOS_TERRAIN_VISUAL_KIND__ = { at:Date.now(), type:"plain-grass-diffuse", width, depth, shader:false };
  return [mesh];
}
export default buildTerrain;
