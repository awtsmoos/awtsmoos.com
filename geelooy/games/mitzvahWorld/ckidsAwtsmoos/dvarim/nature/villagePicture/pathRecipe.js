// B"H
/** @file pathRecipe.js @description Decorative rich dirt path, parser-clear with collider hint. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { add } from "./geometryKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const DIRT = 0x9f7042, DARK = 0x6d4a2d, LIGHT = 0xbc8750;
const STONE = [0xb8aa8a, 0xd1c39f, 0x9f9477, 0xc8bd9d], EDGE = [0x4d8c3c, 0x6aa84a, 0x3c7f32];
const pulse = seed => { const x = Math.sin(seed * 91.17 + 13.31) * 43758.5453; return x - Math.floor(x); };
function dataOf(object) { if (!object.userData) object.userData = {}; return object.userData; }
function curve(t) { return Math.sin(t * Math.PI * 1.12) * 2.7 + Math.sin(t * Math.PI * 2.1) * .42; }
function tile(group, color, position, scale, yaw = 0, mode = "floor") { return add(group, "cube", color, position, scale, [0, yaw, 0], { textureMode:mode }); }
function dirtBed(group) { for (let i=0;i<38;i++) { const t=i/37, z=-17.5+t*35, x=curve(t), yaw=x*.026+Math.sin(i*.7)*.035, w=4.25-Math.abs(t-.5)*.7+pulse(i)*.34; tile(group, i%3?DIRT:DARK, [x,-.108,z], [w,.034,1.15], yaw); if (i%2===0) tile(group, LIGHT, [x+(pulse(i+4)-.5)*w*.58,-.093,z+.14], [.82,.018,.3], yaw+.24); } }
function stones(group) { for (let i=0;i<88;i++) { const t=i/87, z=-16.7+t*33.4, x=curve(t), off=(pulse(i+9)-.5)*2.6; if (pulse(i+20)<.16) continue; tile(group, STONE[i%STONE.length], [x+off,-.052,z], [.34+pulse(i)*.48,.045,.26+pulse(i+1)*.28], x*.045+i*.19, "rock"); } }
function edges(group) { for (let i=0;i<38;i++) { const side=i%2?-1:1, t=pulse(i+33), z=-16+t*32, x=curve(t); tile(group, EDGE[i%EDGE.length], [x+side*(2.1+pulse(i)*.82),-.052,z], [.08,.2+pulse(i+1)*.3,.08], pulse(i+2)*Math.PI, "leaf"); } }
export function pictureDirtPath() { const group = new THREE.Group(); group.name = "pictureDirtPath_grounded_rich_collidable_partner"; dirtBed(group); stones(group); edges(group); Object.assign(dataOf(group), { suggestedRoadCollider:{ width:4.6, length:35, height:.18 } }); return group; }
