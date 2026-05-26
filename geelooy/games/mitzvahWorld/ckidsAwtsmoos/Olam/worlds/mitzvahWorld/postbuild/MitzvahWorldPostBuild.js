/**
 * B"H
 * Chapter 20: The Street Received Its Souls.
 */

import { ensureChossidNpcs } from '../npcs/EnsureChossidNpcs.js';
import { ensureHouseDoors } from '../doors/EnsureHouseDoors.js';
import { ensureGeneratedBattleLayer } from './GeneratedBattleLayer.js';
import { ensureWoodCollectibles } from './WoodCollectiblePostBuild.js';
import { ensureNpcRoles } from './NpcRolePostBuild.js';
import { ensureEmeraldVoidFeatures } from './EmeraldVoidFeaturePostBuild.js';

const STEPS = Object.freeze({
  HOUSE_DOORS: ensureHouseDoors,
  CHOSSID_NPCS: ensureChossidNpcs,
  GENERATED_BATTLE_LAYER: ensureGeneratedBattleLayer,
  WOOD_COLLECTIBLES: ensureWoodCollectibles,
  NPC_ROLES: ensureNpcRoles,
  EMERALD_VOID_FEATURES: ensureEmeraldVoidFeatures
});

function countSceneMarkers(scene) {
  const counts = { roleMarkedNpcs: 0, woodCollectibles: 0, emeraldFeatures: 0, emeraldDoors: 0, emeraldMezuzos: 0 };
  scene?.traverse?.(child => {
    if (child?.userData?.markerType) counts.roleMarkedNpcs++;
    if (child?.userData?.isCollectibleWood) counts.woodCollectibles++;
    if (child?.userData?.emeraldFeature) counts.emeraldFeatures++;
    if (child?.userData?.clickToToggle) counts.emeraldDoors++;
    if (child?.userData?.emeraldFeature === 'mezuzah') counts.emeraldMezuzos++;
  });
  return counts;
}

export async function runMitzvahWorldPostBuild(context = {}) {
  const summary = { steps: {}, finalCounts: {} };

  const settings = (context.scene || context.olam?.scene)?.userData?.mitzvahWorldSettings || {};

  for (const [label, step] of Object.entries(STEPS)) {
    if (settings.disableEmeraldVoidFeatures && label === 'EMERALD_VOID_FEATURES') {
      summary.steps[label] = { ok: true, skipped: true, count: 0 };
      continue;
    }

    try {
      const result = await step(context);
      summary.steps[label] = {
        ok: true,
        count: Array.isArray(result) ? result.length : Number(Boolean(result))
      };
    } catch (error) {
      summary.steps[label] = { ok: false, message: error.message };
    }
  }

  summary.finalCounts = countSceneMarkers(context.scene || context.olam?.scene);
  return summary;
}
