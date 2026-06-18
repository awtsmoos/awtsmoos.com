// B"H
/**
 * @file DynamicSpatialWorld.js
 * @description Chapter 452: the moving beings enter a living map. The
 * Awtsmoos lets every mazik, coin, and wandering spark be found by nearness,
 * not by exhausting the whole olam with a scan. Its refresh is bucketed so one
 * frame does not rebuild the map for every flying letter.
 */
import { SpatialHash2D } from "./hash/SpatialHash2D.js";
import { SpatialHandle } from "./hash/SpatialHandle.js";
import { ensureSpatialMetrics } from "./SpatialMetrics.js";

const DEFAULT_CELL_SIZE = 10;
const DEFAULT_RADIUS = 1.5;
const DEFAULT_REFRESH_MS = 16;

function dynamicList(olam) {
  const raw = olam?.nivrayim || [];
  return Array.isArray(raw) ? raw : Object.values(raw);
}
function positionOf(nivra) {
  return nivra?.mesh?.position || nivra?.modelMesh?.position || nivra?.position || null;
}
function radiusOf(nivra) {
  return Number(nivra?.spatialRadius || nivra?.radius || nivra?.collider?.radius || DEFAULT_RADIUS);
}
function refreshStamp(options = {}) {
  if (options.force) return -1;
  return Math.floor(Date.now() / Math.max(1, options.bucketMs || DEFAULT_REFRESH_MS));
}
export function ensureDynamicSpatial(olam) {
  if (!olam) return null;
  if (!olam.dynamicSpatial) {
    olam.dynamicSpatial = new SpatialHash2D({ cellSize: DEFAULT_CELL_SIZE });
    olam.__dynamicSpatialHandles = new WeakMap();
    olam.__dynamicSpatialMetrics = ensureSpatialMetrics(globalThis);
  }
  return olam.dynamicSpatial;
}
export function installDynamicSpatialWorld(olam) {
  const hash = ensureDynamicSpatial(olam);
  if (!hash) return null;
  globalThis.__AWTS_DYNAMIC_SPATIAL__ = hash;
  globalThis.__AWTS_DYNAMIC_SPATIAL_SNAPSHOT__ = () => hash.snapshot();
  return hash;
}
export function trackDynamicNivra(olam, nivra) {
  const hash = ensureDynamicSpatial(olam), pos = positionOf(nivra);
  if (!hash || !nivra || !pos || nivra.wasSealayked) return null;
  let handle = olam.__dynamicSpatialHandles.get(nivra);
  if (!handle) {
    handle = new SpatialHandle({ id: nivra.id || nivra.name, kind: nivra.type || "nivra", entity: nivra, radius: radiusOf(nivra) });
    olam.__dynamicSpatialHandles.set(nivra, handle);
  }
  hash.upsert(handle, pos.x || 0, pos.z || 0, Math.max(0.1, radiusOf(nivra)));
  return handle;
}
export function untrackDynamicNivra(olam, nivra) {
  const hash = olam?.dynamicSpatial, map = olam?.__dynamicSpatialHandles;
  const handle = map?.get?.(nivra);
  if (hash && handle) hash.remove(handle);
  map?.delete?.(nivra);
}
export function refreshDynamicNivrayim(olam, predicate = null, options = {}) {
  if (!olam) return 0;
  const stamp = refreshStamp(options);
  if (!options.force && !predicate && olam.__dynamicSpatialRefreshStamp === stamp) return olam.__dynamicSpatialRefreshCount || 0;
  let count = 0;
  for (const nivra of dynamicList(olam)) if (nivra && (!predicate || predicate(nivra)) && trackDynamicNivra(olam, nivra)) count += 1;
  if (!predicate) {
    olam.__dynamicSpatialRefreshStamp = stamp;
    olam.__dynamicSpatialRefreshCount = count;
  }
  return count;
}
export function queryDynamicCircle(olam, center, radius, visitor, predicate = null) {
  const hash = ensureDynamicSpatial(olam);
  if (!hash || !center) return 0;
  refreshDynamicNivrayim(olam);
  const metrics = olam.__dynamicSpatialMetrics || ensureSpatialMetrics(globalThis);
  metrics.add("dynamicQueries", 1);
  return hash.queryCircle(center.x || 0, center.z || 0, radius, handle => {
    metrics.add("dynamicCandidates", 1);
    const entity = handle.entity;
    if (!entity || entity.wasSealayked || (predicate && !predicate(entity))) return;
    metrics.add("dynamicHits", 1);
    return visitor(entity, handle);
  });
}
export function dynamicSpatialSnapshot(olam) {
  return olam?.dynamicSpatial?.snapshot?.() || null;
}
