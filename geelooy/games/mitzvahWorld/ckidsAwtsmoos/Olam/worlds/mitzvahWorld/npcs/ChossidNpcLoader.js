// B"H
/** @file ChossidNpcLoader.js @description Shared canonical chossid.glb loader, using top-level compact GLTFLoader import. */
import { GLTFLoader } from "/games/scripts/jsm/loaders/GLTFLoader.js?compact=true&v=real-npc-loader-top-level-20260708-bh11";
import { CHOSSID_GLB_PATH } from "./ChossidGlbPath.js?compact=true&v=real-npc-loader-top-level-20260708-bh11";
let chossidGltfPromise = null;
function sceneOf(gltf) { if (gltf?.scene) return gltf.scene; if (gltf?.scenes?.[0]) return gltf.scenes[0]; return gltf || null; }
function animationsOf(gltf, scene) { return gltf?.animations || scene?.animations || []; }
function camerasOf(gltf) { return gltf?.cameras || []; }
function envelope(gltf) { const scene = sceneOf(gltf); if (!scene) throw new Error("chossid.glb loaded without a scene"); return { scene, animations:animationsOf(gltf, scene), cameras:camerasOf(gltf) }; }
async function loadChossidEnvelope(context = {}) { const capabilities = context.rendererCapabilities || context; if (capabilities && typeof capabilities.loadModel === "function") return envelope(await capabilities.loadModel(CHOSSID_GLB_PATH)); if (context && typeof context.loadGLTF === "function") return envelope(await context.loadGLTF(CHOSSID_GLB_PATH)); return envelope(await new Promise((resolve, reject) => { new GLTFLoader().load(CHOSSID_GLB_PATH, resolve, undefined, reject); })); }
export async function loadFreshChossidGltf(context = {}) { if (!chossidGltfPromise) chossidGltfPromise = loadChossidEnvelope(context).catch(error => { chossidGltfPromise = null; throw error; }); return chossidGltfPromise; }
