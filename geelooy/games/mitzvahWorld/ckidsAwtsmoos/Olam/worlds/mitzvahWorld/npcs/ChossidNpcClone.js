// B"H
/** @file ChossidNpcClone.js @description Clones the loaded chossid.glb scene for NPC use, parser-clear. */
import * as SkeletonUtils from "/games/scripts/jsm/utils/SkeletonUtils.js";
import { sanitizeLivingModelTree } from "./LivingModelSanitizer.js?v=awtsmoos-living-model-sanitizer-20260614-bh2";
import { sanitizeRenderGeometryTree } from "../runtime/RenderGeometrySanitizer.js?v=total-overhaul-render-sanitize-20260705-bh1";
function sceneOf(gltf) { if (gltf && gltf.scene) return gltf.scene; if (gltf && gltf.scenes && gltf.scenes[0]) return gltf.scenes[0]; return null; }
function markMesh(child) { if (!child.userData) child.userData = {}; child.userData.isLiving = true; child.userData.isNpc = true; child.userData.skipOctree = true; child.userData.noOctree = true; if (!child.isMesh && !child.isSkinnedMesh) return; child.castShadow = false; child.receiveShadow = true; child.userData.isNpcPart = true; }
export function cloneChossidNpcScene(gltf) { const source = sceneOf(gltf); if (!source || typeof source.clone !== "function") throw new Error("Loaded chossid.glb does not contain a cloneable scene"); const clone = SkeletonUtils.clone(source); if (!clone.userData) clone.userData = {}; clone.userData.isLiving = true; clone.userData.isNpc = true; clone.userData.skipOctree = true; clone.userData.noOctree = true; sanitizeLivingModelTree(clone, { isNpc:true }); sanitizeRenderGeometryTree(clone, { warn:false }); clone.traverse(markMesh); return clone; }
