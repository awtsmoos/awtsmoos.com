// B"H
/**
 * @file LivingRegionLayers.js
 * @description Small layer helpers; progress carries primitive house proof,
 * door-click proof, and room counts without circular THREE references.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { postWorkerProgress } from "../../../../../oyved/core/protocol/WorkerProtocol.js?compact=true&v=total-overhaul-path-fix-20260705-bh1";
export const DEFERRED_LAYERS = Object.freeze(["mountains", "grass", "wheat", "flowers", "bushes", "rocks", "trees", "water", "farms", "parcels", "landmarks", "battleLayer", "visualReality", "botanicalReality", "ecologyReality"]);
function primitiveStats(layer) { const s = layer?.userData?.stats || {}; return { skipped:Boolean(s.skipped), deferred:Boolean(s.deferred), cottages:s.cottages || 0, colliderSources:s.colliderSources || 0, clickableDoors:s.clickableDoors || 0, internalRooms:s.internalRooms || 0, interiorFloors:s.interiorFloors || 0, doorClickOpenProof:s.doorClickOpenProof || null, octreeProof:s.octreeProof || null, reason:s.reason || null }; }
export function markLiving(stage, data = {}) { try { postWorkerProgress(`living-runtime:${stage}`, data); } catch (error) { globalThis.__AWTS_LIVING_PROGRESS_ERROR__ = error?.message || String(error); } }
export function addLayer(root, name, factory) { const started = performance.now(); markLiving(`${name}:start`); const layer = factory(); root.add(layer); markLiving(`${name}:done`, { elapsedMs:Math.round(performance.now() - started), children:layer.children?.length || 0, count:layer.count || 0, stats:primitiveStats(layer) }); return layer; }
export function skippedLayer(name, reason = "player-first-load") { const layer = new THREE.Group(); layer.name = `deferred_${name}_until_after_first_render`; layer.userData.stats = { skipped:true, deferred:true, reason }; return layer; }
