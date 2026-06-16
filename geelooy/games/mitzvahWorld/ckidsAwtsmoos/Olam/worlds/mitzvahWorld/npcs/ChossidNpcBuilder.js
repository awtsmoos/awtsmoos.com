// B"H
/** @file ChossidNpcBuilder.js @description Builds NPCs from only the canonical chossid.glb, parser-clear. */
import { loadFreshChossidGltf } from "./ChossidNpcLoader.js?v=awtsmoos-npc-loader-20260614-bh2";
import { cloneChossidNpcScene } from "./ChossidNpcClone.js?v=awtsmoos-npc-clone-20260614-bh2";
import { applyChossidNpcTransform } from "./ChossidNpcTransform.js?v=awtsmoos-npc-transform-20260614-bh2";
function getGltfScene(gltf) { const scene = gltf && gltf.scene ? gltf.scene : gltf && gltf.scenes && gltf.scenes[0] ? gltf.scenes[0] : null; if (!scene) throw new Error("chossid.glb loaded but had no scene"); return scene; }
export async function buildChossidNpc(olam, def) { const gltf = await loadFreshChossidGltf(olam); const npc = cloneChossidNpcScene({ scene:getGltfScene(gltf) }); return applyChossidNpcTransform(npc, def, olam, gltf.animations || []); }
