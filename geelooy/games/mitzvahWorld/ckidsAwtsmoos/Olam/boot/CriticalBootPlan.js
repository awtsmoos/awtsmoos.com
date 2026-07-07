// B\"H
/**
 * CriticalBootPlan separates the first breath from later abundance. The
 * Awtsmoos gives the Chossid ground, sky, light, control, and truth first;
 * the full village then streams in without being deleted.
 */
const CRITICAL_TYPES = new Set([
  'VillageCameraPreset',
  'ProceduralSky',
  'VillageLightingRig',
  'ProceduralTerrain',
  'VillageGroundPlane',
  'VillageRoadCollider',
  'VillageHouseCollider',
  'Chossid'
]);

export function isCriticalNivraType(type, options = {}) {
  if (options?.bootCritical === true) return true;
  if (options?.deferUntilPlayable === true) return false;
  return CRITICAL_TYPES.has(type);
}

export function splitBootEntries(entries) {
  const critical = [];
  const deferred = [];
  for (const entry of entries) {
    (isCriticalNivraType(entry.type, entry.options) ? critical : deferred).push(entry);
  }
  return { critical, deferred };
}

export function bootBudgetSummary(entries) {
  const { critical, deferred } = splitBootEntries(entries);
  return { total: entries.length, critical: critical.length, deferred: deferred.length };
}
