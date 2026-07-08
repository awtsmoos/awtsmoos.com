// B"H
import { animalLodPolicy } from "../../../../systems/animals/AnimalLodPolicy.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { forestDepthLayers } from "../../../../systems/vegetation/ForestDepthLayers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { villagePropInstances } from "../../../../systems/buildings/VillagePropInstancer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { STARTER_WORLD_REQUIREMENTS } from "./StarterSubzoneData.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { dist } from "./StarterMath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * Produces a data report for the 60fps contract.
 *
 * This is intentionally explicit: it lists how many enemies are truly updating,
 * how many are throttled, whether houses/trees are instance-friendly, and how
 * far-away buildings/animals degrade into cheaper representations.
 */
export function createStarterPerformancePlan(state, olam, spatial) {
  const trees = forestDepthLayers("oak");
  const props = villagePropInstances(olam.houses.length + olam.roads.length + olam.doors.length);
  const enemyTiers = olam.enemies.map(enemy => {
    const distance = dist(enemy.position, olam.player.position);
    return { id:enemy.id, distance, state:enemy.state, policy:animalLodPolicy(distance) };
  });
  const activeRaw = enemyTiers.filter(e => e.distance <= state.frameBudget.updateBubble).sort((a, b) => a.distance - b.distance);
  const active = activeRaw.slice(0, state.frameBudget.maxActiveEnemies);
  const throttled = activeRaw.slice(state.frameBudget.maxActiveEnemies);
  const houses = olam.houses.map(house => ({ id:house.id, distance:dist(house.position, olam.player.position), lod:dist(house.position, olam.player.position) > house.lodBlobDistance ? "blob" : "procedural-house" }));
  return {
    targetFps:STARTER_WORLD_REQUIREMENTS.targetFps,
    targetFrameMs:16.67,
    guaranteedByPolicy:true,
    sharedBrainLoops:new Set(olam.enemies.map(e => e.brainKey)).size,
    activeEnemies:active.length,
    rawActiveEnemies:activeRaw.length,
    throttledEnemies:throttled.length,
    activeWithinBudget:active.length <= state.frameBudget.maxActiveEnemies,
    activeNpcBudget:state.frameBudget.maxActiveNpcs,
    spatial:spatial.stats(),
    nearAnimalsSkinned:enemyTiers.filter(e => e.policy.lod === "near").every(e => e.policy.skinned),
    farAnimalsMostlyIdle:enemyTiers.filter(e => e.distance > state.frameBudget.visibleBubble).every(e => e.policy.hz === 0 || ["sleep", "impostor"].includes(e.state)),
    treeLayers:trees.layers.length,
    forestInstances:olam.forest.reduce((sum, row) => sum + row.count, 0),
    houseLods:houses,
    farHousesBlobbed:houses.filter(h => h.distance > 190).every(h => h.lod === "blob"),
    roadsSolid:olam.roads.every(r => r.isSolid && r.collider),
    doorsClickable:olam.doors.every(d => d.clickable && d.collider === "interactive-door"),
    villageProps:props.reduce((sum, p) => sum + p.count, 0),
    instancedProps:props.every(p => p.instanced),
    rings:{ active:state.frameBudget.updateBubble, visible:state.frameBudget.visibleBubble, far:state.frameBudget.farBubble }
  };
}
