// B"H
/** @file landscapeRecipes.js @description Parser-clear decorative village landscape recipes. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { add } from "./geometryKit.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { PICTURE_COLORS as C } from "./palette.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { instancedFlowerField } from "./vegetation/flowerField.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { instancedRockField } from "./vegetation/rockField.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
const cube = (g, c, p, s, r = [0,0,0], mode = "wood") => add(g, "cube", c, p, s, r, { textureMode:mode });
function dataOf(object) { if (!object.userData) object.userData = {}; return object.userData; }
export function cobbleRoad() { const group = new THREE.Group(); for (let i=0;i<34;i++) { const t=i/33, z=-15+t*29, curve=Math.sin(t*Math.PI*1.15)*2.4; cube(group, i%2?0xb8a783:0xd0c19d, [curve+Math.sin(i*2.1)*.24,-.07,z], [.7+(i%3)*.14,.045,.52], [0,curve*.04+i*.17,0], "stone"); } return group; }
export function terrace() { const group = new THREE.Group(); cube(group, C.stone, [0,.2,0], [18,.4,7.5], [0,0,0], "stone"); cube(group, C.stoneDark, [0,-.08,4.05], [18.5,.45,.55], [0,0,0], "stone"); return group; }
export function steps() { const group = new THREE.Group(); for (let i=0;i<5;i++) cube(group, C.stone, [0,i*.13,i*.48], [4.4-i*.28,.16,.46], [0,0,0], "stone"); return group; }
export function bench() { const group = new THREE.Group(); cube(group, C.wood, [0,.55,0], [2.55,.16,.48]); cube(group, C.wood, [0,.98,-.32], [2.55,.16,.16], [.35,0,0]); [-1,1].forEach(x => { cube(group, C.darkWood, [x,.25,.2], [.16,.5,.16]); cube(group, C.darkWood, [x,.25,-.2], [.16,.5,.16]); }); return group; }
export function fence(options = {}) { const group = new THREE.Group(), count = Math.max(2, Math.floor(Number(options.count || 10))); for (let i=0;i<count;i++) { const x=i*.92, tall=i%4===0?1.28:1.08; cube(group, C.darkWood, [x,tall/2,0], [.16,tall,.18]); cube(group, C.wood, [x,tall+.08,0], [.22,.16,.22], [0,0,Math.PI/4]); } const mid=(count-1)*.46, len=count*.92; cube(group, C.wood, [mid,.78,0], [len,.13,.13]); cube(group, C.wood, [mid,.45,0], [len,.11,.12]); Object.assign(dataOf(group), { fenceVisualOnly:true, suggestedCollider:{ length:len, height:1.1, depth:.45 } }); return group; }
export function well() { const group = new THREE.Group(); add(group, "cylinder", C.stone, [0,.55,0], [1.22,.62,1.22], [0,0,0], { textureMode:"stone" }); add(group, "cylinder", C.darkWood, [0,1.22,0], [1.42,.1,1.42], [0,0,0], { textureMode:"wood" }); return group; }
export function flowerPatch(options = {}) { return instancedFlowerField(options); }
export function rock(options = {}) { return instancedRockField({ count:options.count || 10, radius:options.radius || 1.2, seed:options.seed || 3 }); }
export function rockField(options = {}) { return instancedRockField(options); }
