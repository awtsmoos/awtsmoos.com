// B"H
/** Brick primitives: the cubit where cottage truth becomes mesh and collider. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { materialWithTexture } from "../../materials/ProceduralTextureKit.js?compact=true&v=intense-dirt-grain-20260615-bh904";
const WALLS = new Map();
export const pos = (x, y, z) => [x, y, z];
export const material = color => color?.isMaterial ? color : new THREE.MeshLambertMaterial({ color, transparent:false, opacity:1, depthWrite:true, depthTest:true });
export const wallMaterial = () => WALLS.get("brick") || (WALLS.set("brick", materialWithTexture("brick", { size:384 })), WALLS.get("brick"));
export function box(name, size, position, matLike, data = {}) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(matLike)); mesh.name = name; mesh.position.set(...position); mesh.castShadow = false; mesh.receiveShadow = true; Object.assign(mesh.userData ||= {}, data, { cottageVisual:true, opacitySealed:true }); return mesh; }
export function wallPiece(group, house, side, name, size, position, yaw = 0) { const mesh = box(`cottage_${house.id}_${side}_${name}`, size, position, wallMaterial(), { cottageWallSection:true, houseId:house.id, side, texturedBrickWall:true }); mesh.rotation.y = yaw; group.add(mesh); return mesh; }
export function wallCollider(house, side, name, size, position, yaw = 0, extra = {}) { return { id:`${house.id}_${side}_${name}_collider`, category:"cottage-wall", owner:house.id, position, size, yaw, solid:true, static:true, ...extra }; }
