// B"H
/**
 * @file buildBrickWall.js
 * @description Instanced textured wall with parser-clear static collider and optional octree proxy.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
const DUMMY = new THREE.Object3D();
function propsOf(def) { return def && def.props ? def.props : {}; }
function triple(value, fallback) { return Array.isArray(value) ? value : fallback; }
function physicsDef(props) { return props && props.physics ? props.physics : null; }
function addStaticBoxToPhysics(physics, x, y, z, hx, hy, hz) {
  try {
    if (physics && typeof physics.addStaticBox === "function") physics.addStaticBox({ x, y, z }, { hx, hy, hz });
    else if (physics && physics.world && typeof physics.world.createRigidBody === "function" && physics.RAPIER) { const R = physics.RAPIER; const body = physics.world.createRigidBody(R.RigidBodyDesc.fixed().setTranslation(x, y, z)); physics.world.createCollider(R.ColliderDesc.cuboid(hx, hy, hz), body); }
  } catch (error) { console.error("B\"H - buildBrickWall physics error:", error); }
}
function addOctreeProxy(olam, group, wallW, wallH, brickD, brickH) {
  if (!olam || !olam.worldOctree || typeof olam.worldOctree.fromGraphNode !== "function") return;
  const proxy = new THREE.Mesh(new THREE.BoxGeometry(wallW, wallH, brickD)); proxy.name = "brick_wall_octree_proxy"; proxy.position.set(0, wallH / 2 - brickH / 2, 0); proxy.visible = false; proxy.userData.isSolid = true; group.add(proxy); olam.worldOctree.fromGraphNode(proxy);
}
function makeMesh(geometry, material, count) { const mesh = new THREE.InstancedMesh(geometry, material, count); mesh.castShadow = true; mesh.receiveShadow = true; return mesh; }
export async function buildBrickWall(scene, physics, def, olam = null) {
  const props = propsOf(def), bricksX = props.bricksX || 10, bricksY = props.bricksY || 3, brickW = props.brickW || 2, brickH = props.brickH || 1, brickD = props.brickD || .5;
  const colorA = props.colorA || 0xb5651d, colorB = props.colorB || 0x8b4513, position = triple(def.position, [0,0,0]), rotation = triple(def.rotation, [0,0,0]);
  const total = bricksX * bricksY, gap = .05;
  const meshA = makeMesh(new THREE.BoxGeometry(brickW-gap, brickH-gap, brickD-gap), new THREE.MeshLambertMaterial({ color:colorA }), total);
  const meshB = makeMesh(new THREE.BoxGeometry(brickW-gap, brickH-gap, brickD-gap), new THREE.MeshLambertMaterial({ color:colorB }), total);
  let countA = 0, countB = 0;
  for (let row=0; row<bricksY; row++) { const offset = row % 2 === 0 ? 0 : brickW / 2; for (let col=0; col<bricksX; col++) { const bx = col * brickW - bricksX * brickW / 2 + offset, by = row * brickH; DUMMY.position.set(bx, by, 0); DUMMY.rotation.set(0,0,0); DUMMY.scale.set(1,1,1); DUMMY.updateMatrix(); if ((row + col) % 2 === 0) meshA.setMatrixAt(countA++, DUMMY.matrix); else meshB.setMatrixAt(countB++, DUMMY.matrix); } }
  meshA.count = countA; meshB.count = countB; meshA.instanceMatrix.needsUpdate = true; meshB.instanceMatrix.needsUpdate = true;
  const group = new THREE.Group(); group.add(meshA, meshB); group.position.set(position[0], position[1], position[2]); group.rotation.set(rotation[0], rotation[1], rotation[2]); group.name = def.id || "brick_wall";
  const wallW = bricksX * brickW, wallH = bricksY * brickH; addOctreeProxy(olam, group, wallW, wallH, brickD, brickH);
  const phys = physicsDef(props); if (physics && phys) addStaticBoxToPhysics(physics, position[0], position[1] + wallH / 2, position[2], wallW / 2, wallH / 2, brickD / 2);
  return [group];
}
