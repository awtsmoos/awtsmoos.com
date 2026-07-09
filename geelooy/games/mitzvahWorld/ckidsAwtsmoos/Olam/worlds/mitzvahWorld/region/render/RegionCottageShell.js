// B"H
/**
 * @file RegionCottageShell.js
 * @description
 * Collider-matched walls and placement. The Awtsmoos keeps the house body and
 * its collider story aligned without crowding the renderer conductor.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { materialWithTexture } from "../../materials/ProceduralTextureKit.js?compact=true&v=ping-pong-crisp-textures-20260622-bh1";
import { groundY } from "./RegionGround.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { houseColliderSlabs } from "./RegionHouseColliderPlan.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

const WALL_MATERIAL = materialWithTexture("brick", { size: 384 });

export function shellColliders(house) {
  return houseColliderSlabs(house).map(slab => ({
    id: `${slab.houseId}_${slab.name}_wall`,
    category: "cottage-wall",
    owner: slab.houseId,
    position: slab.center,
    size: slab.size,
    yaw: 0,
    doorGap: slab.name.startsWith("front") ? { width: slab.doorWidth, height: slab.doorHeight } : null
  }));
}

export function buildFastShell(house) {
  const slabs = houseColliderSlabs(house);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), WALL_MATERIAL, slabs.length);
  const matrix = new THREE.Matrix4();
  mesh.name = `${house.id}_instanced_collider_matched_cottage_walls`;
  slabs.forEach((slab, index) => {
    matrix.compose(new THREE.Vector3(...slab.center), new THREE.Quaternion(), new THREE.Vector3(...slab.size));
    mesh.setMatrixAt(index, matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  Object.assign(mesh.userData ||= {}, {
    cottageVisual: true,
    colliderMatchedShell: true,
    instancedColliderMatchedWalls: true,
    texturedBrickWall: true,
    houseId: house.id,
    wallPanels: slabs.length
  });
  return mesh;
}

export function placeCottage(root, house, olam) {
  root.position.set(house.x || 0, groundY(olam, house.x || 0, house.z || 0), house.z || 0);
  root.rotation.y = house.yaw || house.rotationY || 0;
  root.updateMatrixWorld?.(true);
}
