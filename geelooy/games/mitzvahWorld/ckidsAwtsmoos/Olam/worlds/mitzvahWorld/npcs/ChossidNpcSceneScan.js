// B"H
/** @file ChossidNpcSceneScan.js @description Scene NPC scan without optional chaining. */
function dataOf(child) { return child && child.userData ? child.userData : {}; }
function nameOf(child) { return String(child && child.name ? child.name : "").toLowerCase(); }
export function scanChossidNpcScene(scene) { const out = []; if (!scene || typeof scene.traverse !== "function") return out; scene.traverse(child => { const data = dataOf(child); if (data.isNpc === true || data.mitzvahWorldNpcRoot === true || nameOf(child).startsWith("npc_")) out.push(child); }); return out; }
export function countChossidNpcScene(scene) { return scanChossidNpcScene(scene).length; }
export default scanChossidNpcScene;
