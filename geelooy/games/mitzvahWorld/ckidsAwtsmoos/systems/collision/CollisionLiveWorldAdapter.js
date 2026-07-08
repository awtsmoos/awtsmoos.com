// B"H
import CollisionWorld2D from "./CollisionWorld2D.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import CollisionTriggerRuntime from "./CollisionTriggerRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { validateVillageDensity } from "../worldGeneration/VillageDensityValidator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;

export function buildLiveCollisionBodies(data = {}) {
  const bodies = [];
  for (const h of data.houses || []) bodies.push({ ...h, kind:h.kind || "house", solid:true });
  for (const w of data.walls || []) bodies.push({ ...w, kind:w.kind || "wall", solid:true });
  for (const d of data.doors || []) {
    bodies.push({ ...d, id:d.id || `${d.name}_solid`, kind:"door", solid:true, open:Boolean(d.open || d.isOpen) });
    bodies.push({ ...d.trigger, id:d.trigger?.id || `${d.id || d.name}_trigger`, kind:"door-trigger", x:n(d.trigger?.x, n(d.x)), z:n(d.trigger?.z, n(d.z)), width:n(d.trigger?.width, n(d.width, 1) + 1), depth:n(d.trigger?.depth, n(d.depth, 1) + 1), trigger:true, solid:false, data:{ doorId:d.id || d.name, locked:Boolean(d.locked) } });
  }
  for (const t of data.triggers || []) bodies.push({ ...t, kind:t.kind || "trigger", trigger:true, solid:false });
  for (const h of data.hazards || []) bodies.push({ ...h, kind:h.kind || "hazard", trigger:true, solid:false });
  return bodies;
}

export function createLiveCollisionBridge(olam = {}, data = {}, options = {}) {
  const world = new CollisionWorld2D({ cellSize:options.cellSize || 6, bodies:buildLiveCollisionBodies(data) });
  const triggers = new CollisionTriggerRuntime(world);
  const density = validateVillageDensity({ houses:data.houses || [], roads:data.roads || [], points:data.points || [], doors:data.doors || [], spawns:data.spawns || [], bounds:data.bounds, maxEmptyRatio:options.maxEmptyRatio ?? 0.55 });
  const bridge = { world, triggers, data, density, entities:[...(data.npcs || []), ...(data.animals || []), ...(data.hostiles || []), ...(data.doors || [])] };
  olam.__collisionLiveBridge = bridge;
  return bridge;
}

export function liveBridgeReport(bridge = {}) {
  const data = bridge.data || {};
  return {
    houses:(data.houses || []).length,
    doors:(data.doors || []).length,
    triggers:(data.triggers || []).length + (data.doors || []).length + (data.hazards || []).length,
    npcs:(data.npcs || []).length,
    animals:(data.animals || []).length,
    hostiles:(data.hostiles || []).length,
    colliders:bridge.world?.bodies?.size || 0,
    density:bridge.density || null,
    broadphase:bridge.world?.metrics || null
  };
}

export default { createLiveCollisionBridge, buildLiveCollisionBodies, liveBridgeReport };
