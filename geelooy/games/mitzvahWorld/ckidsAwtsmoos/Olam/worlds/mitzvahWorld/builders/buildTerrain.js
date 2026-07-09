// B"H
/**
 * @file buildTerrain.js
 * @description Visible hosted-texture terrain registered as walkable ground authority.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { createGroundMixMaterial } from "./shaders/GroundMixShader.js?compact=true&v=hosted-ground-textures-20260708-bh1";
import { DEFAULT_GROUND_TEXTURE_URLS, normalizeGroundTextureUrls } from "./shaders/GroundTextureConfig.js?compact=true&v=hosted-ground-textures-20260708-bh1";
import { registerGroundMesh as registerMeshGroundAuthority } from "../collision/GroundCollisionWorld.js?compact=true&v=inline-octree-no-worker-import-20260702-bh1";

const fallbackTriple = (value, fallback) => Array.isArray(value) ? value : fallback;
const propsOf = def => def?.props || {};
const colorFrom = (props, key, fallback) => new THREE.Color(props?.[key] ?? fallback);
const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function textureUrlsOf(props) {
  return normalizeGroundTextureUrls(props.textureUrls || props.groundTextures || DEFAULT_GROUND_TEXTURE_URLS);
}

function addStaticBox(physics, x, y, z, hx, hy, hz) {
  if (typeof physics?.addStaticBox === "function") return physics.addStaticBox(x, y, z, hx, hy, hz);
  const RAPIER = physics?.RAPIER || globalThis.RAPIER;
  if (!RAPIER || typeof physics?.createRigidBody !== "function") return null;
  const bodyDesc = RAPIER.RigidBodyDesc?.fixed?.().setTranslation?.(x, y, z);
  const body = physics.createRigidBody(bodyDesc);
  physics.createCollider?.(RAPIER.ColliderDesc.cuboid(hx, hy, hz), body);
  return body;
}

function markMeshAsGround(mesh, def, textureUrls) {
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
    hostedGroundTextures:textureUrls
  });
  mesh.raycast ||= THREE.Mesh.prototype.raycast;
}

function registerGroundMesh(olam, mesh) {
  if (!olam || !mesh) return;
  olam.__awtsmoosGroundCollisionMeshes ||= [];
  if (!olam.__awtsmoosGroundCollisionMeshes.includes(mesh)) olam.__awtsmoosGroundCollisionMeshes.push(mesh);
  registerMeshGroundAuthority(olam, mesh);
  olam.__awtsmoosTerrainVisualMesh = mesh;
  olam.__awtsmoosTerrainGroundAuthority = {
    at:Date.now(), name:mesh.name, skipGlobalOctree:true, source:"buildTerrain-hosted-ground"
  };
}

export async function buildTerrain(scene, physics, def, olam = null) {
  const props = propsOf(def), width = finite(props.width, 200), depth = finite(props.depth, 200);
  const position = fallbackTriple(def?.position, [0, 0, 0]);
  const geo = new THREE.PlaneGeometry(width, depth, finite(props.segmentsX, 96), finite(props.segmentsZ, 96));
  geo.rotateX(-Math.PI / 2);
  geo.computeBoundingBox?.(); geo.computeBoundingSphere?.();
  const textureUrls = textureUrlsOf(props);
  const mat = createGroundMixMaterial({
    textureUrls,
    fallbackColor:colorFrom(props, "grassColor", 0x2e7d32),
    textureScale:finite(props.textureScale ?? props.shaderScale, 0.085),
    randomScale:finite(props.randomScale, 0.055),
    repeat:finite(props.textureRepeat, 18),
    grassPatches:props.grassPatches || []
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = def?.id || "terrain_ground";
  mesh.position.set(finite(position[0], 0), finite(position[1], 0), finite(position[2], 0));
  mesh.receiveShadow = props.receiveShadow !== false;
  mesh.frustumCulled = false;
  mesh.renderOrder = Number.isFinite(Number(props.renderOrder)) ? Number(props.renderOrder) : -20;
  markMeshAsGround(mesh, def, textureUrls);
  mesh.updateMatrixWorld?.(true);
  registerGroundMesh(olam, mesh);
  const phys = props.physics;
  if (physics && phys) {
    const half = fallbackTriple(phys.halfExtents, [width / 2, 0.5, depth / 2]);
    addStaticBox(physics, mesh.position.x, mesh.position.y - finite(half[1], 0.5), mesh.position.z, finite(half[0], width / 2), finite(half[1], 0.5), finite(half[2], depth / 2));
  }
  return [mesh];
}

export default buildTerrain;
