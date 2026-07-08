// B"H
/** @file NpcPostBuild.js @description Ensures fallback visible NPCs exist without optional chaining. */
import { createSimpleNpcMesh } from "./SimpleNpcMesh.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function nameOf(item) { return String(item && item.name ? item.name : item && item.id ? item.id : "").toLowerCase(); }
function typeOf(item) { return String(item && item.type ? item.type : "").toLowerCase(); }
function countNpcs(nivrayim = []) { return nivrayim.filter(item => { const name = nameOf(item), type = typeOf(item); return name.includes("npc") || type.includes("npc") || type.includes("citizen") || type.includes("interactive"); }).length; }
function sceneOf(context) { const olam = context && context.olam ? context.olam : null; return olam && olam.scene ? olam.scene : context && context.scene ? context.scene : null; }
function nivrayimOf(context) { return context && Array.isArray(context.nivrayim) ? context.nivrayim : context && context.olam && Array.isArray(context.olam.nivrayim) ? context.olam.nivrayim : []; }
function markNpc(npc, i) { if (!npc.userData) npc.userData = {}; Object.assign(npc.userData, { isNpc:true, fallbackNpc:true, skipOctree:true, noOctree:true, nefeshId:`fallback-visible-npc-${i}` }); }
export async function ensureVisibleNpcs(context = {}) { const scene = sceneOf(context); if (!scene) return []; if (countNpcs(nivrayimOf(context)) > 0) return []; const spots = [{x:3,y:0,z:-6},{x:-4,y:0,z:-8},{x:7,y:0,z:4},{x:-8,y:0,z:5}], made = []; for (let i = 0; i < spots.length; i++) { const npc = createSimpleNpcMesh({ name:`fallback-visible-npc-${i}`, shirt:[0xffffff,0x2457a6,0x1f6937,0x7c4b1d][i], scale:1 }); npc.position.set(spots[i].x, spots[i].y, spots[i].z); npc.rotation.y = i * .7; markNpc(npc, i); scene.add(npc); made.push(npc); } return made; }
export default ensureVisibleNpcs;
