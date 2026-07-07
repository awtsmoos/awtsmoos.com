// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import TerrainMaterial from './terrain/TerrainMaterial.js';
import { groundTextures } from '../geelooy/libs/awtsmoosCinematicWorld/assets/ChaiForestStaticAssets.js';
export async function buildTerrain(scene, physics, def) {
  const { width = 200, depth = 200, color = 0x7ec850, receiveShadow = true, textureName = 'dirt', textureUrl = null } = def.props || {};
  const [px, py, pz] = def.position || [0, 0, 0];
  const geo = new THREE.PlaneGeometry(width, depth, 1, 1); geo.rotateX(-Math.PI / 2);
  const maps = groundTextures(true);
  const mat = TerrainMaterial.weave(color, { textureUrl: textureUrl || maps[textureName] || maps.dirt, repeatX: Math.max(6, width / 18), repeatY: Math.max(6, depth / 18) });
  const mesh = new THREE.Mesh(geo, mat); mesh.position.set(px, py, pz); mesh.receiveShadow = receiveShadow; mesh.name = def.id;
  mesh.userData.groundAware = true; mesh.userData.actualTexture = mat.userData.awtsmoosActualNamedTexture;
  if (physics && def.props?.physics) { const [hx, hy, hz] = def.props.physics.halfExtents || [width / 2, 0.5, depth / 2]; addStaticBox(physics, px, py - hy, pz, hx, hy, hz); }
  return [mesh];
}
function addStaticBox(physics, x, y, z, hx, hy, hz) {
  try {
    if (typeof physics.addStaticBox === 'function') return physics.addStaticBox({ x, y, z }, { hx, hy, hz });
    if (physics.world?.createRigidBody) { const R = physics.RAPIER; const body = physics.world.createRigidBody(R.RigidBodyDesc.fixed().setTranslation(x, y, z)); physics.world.createCollider(R.ColliderDesc.cuboid(hx, hy, hz), body); }
  } catch (e) { console.error('B"H terrain collider error', e); }
}
