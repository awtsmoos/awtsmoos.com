// B"H
/** @file ChossidNpcLoader.js @description Shared canonical chossid.glb loader with parser-clear envelope. */
import { CHOSSID_GLB_PATH } from "./ChossidGlbPath.js";
let chossidGltfPromise = null;
function sceneOf(gltf) { if (gltf && gltf.scene) return gltf.scene; if (gltf && gltf.scenes && gltf.scenes[0]) return gltf.scenes[0]; return gltf || null; }
function animationsOf(gltf, scene) { return gltf && gltf.animations ? gltf.animations : scene && scene.animations ? scene.animations : []; }
function camerasOf(gltf) { return gltf && gltf.cameras ? gltf.cameras : []; }
function envelope(gltf) { const scene = sceneOf(gltf); if (!scene) throw new Error("chossid.glb loaded without a scene"); return { scene, animations:animationsOf(gltf, scene), cameras:camerasOf(gltf) }; }
function canLoadBrowserModules() { return typeof window !== "undefined" || (typeof WorkerGlobalScope !== "undefined" && globalThis.self instanceof WorkerGlobalScope); }
async function loadChossidEnvelope(context = {}) { const capabilities = context.rendererCapabilities || context; if (capabilities && typeof capabilities.loadModel === "function") return envelope(await capabilities.loadModel(CHOSSID_GLB_PATH)); if (context && typeof context.loadGLTF === "function") return envelope(await context.loadGLTF(CHOSSID_GLB_PATH)); if (!canLoadBrowserModules()) throw new Error("Cannot load chossid.glb without renderer capabilities or olam.loadGLTF"); const { GLTFLoader } = await import("/games/scripts/jsm/loaders/GLTFLoader.js"); return envelope(await new Promise((resolve, reject) => { new GLTFLoader().load(CHOSSID_GLB_PATH, resolve, undefined, reject); })); }
export async function loadFreshChossidGltf(context = {}) { if (!chossidGltfPromise) { chossidGltfPromise = loadChossidEnvelope(context).catch(error => { chossidGltfPromise = null; throw error; }); } return chossidGltfPromise; }
