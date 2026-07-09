// B"H
/**
 * @file VillagePolishGround.js
 * @description Village polish drinks from the same GroundTruth law as roads, grass, colliders, trees, NPCs.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { groundY } from "../region/ground/GroundTruth.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
export const ROAD_SPINE = Object.freeze([[-145,-42],[-112,-22],[-80,-8],[-45,2],[-10,10],[25,18],[62,31],[98,49],[135,72]]);
export const LANDMARKS = Object.freeze({ square:[0,14], well:[-14,18], study:[-34,35], greatTree:[34,34], orchard:[86,54], gate:[-126,-30] });
export function yAt(olam, x, z, fallback = 0) { return groundY(olam, x, z, fallback); }
function segmentDistance(x,z,a,b) { const ax=a[0],az=a[1],bx=b[0],bz=b[1],dx=bx-ax,dz=bz-az; const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1))); return Math.hypot(x-(ax+dx*t), z-(az+dz*t)); }
export function roadDistance(x, z) { let best = Infinity; for (let i=0;i<ROAD_SPINE.length-1;i++) best = Math.min(best, segmentDistance(x,z,ROAD_SPINE[i],ROAD_SPINE[i+1])); return best; }
export function roadMask(x, z, radius = 8) { return Math.max(0, 1 - roadDistance(x,z) / Math.max(.01, radius)); }
export function ecologyKind(x,z) { if (roadMask(x,z,10)>.35) return "trampled-road-edge"; if (Math.hypot(x-LANDMARKS.square[0],z-LANDMARKS.square[1])<30) return "village-square"; if (Math.hypot(x-LANDMARKS.greatTree[0],z-LANDMARKS.greatTree[1])<42) return "sacred-grove"; if (Math.hypot(x-LANDMARKS.orchard[0],z-LANDMARKS.orchard[1])<48) return "orchard"; return "wild"; }
export function groundedGroup(name, olam, x, z, rot = 0) { const g = new THREE.Group(); g.name = name; g.position.set(x, yAt(olam,x,z)+.02, z); g.rotation.y = rot; return g; }
function markDecor(c, extra) { if (!c.userData) c.userData = {}; Object.assign(c.userData, { villageDecor:true, skipRaycast:true, skipOctree:true, noOctree:true }, extra); }
export function sealDecor(root, extra = {}) { if (!root) return root; if (typeof root.traverse === "function") root.traverse(c => markDecor(c, extra)); else markDecor(root, extra); return root; }
