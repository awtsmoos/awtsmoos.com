// B"H
// tests/insight/doorTargetReport.mjs

import { maps } from '../../js/data/maps.js';

/**
 * Chapter 2: A door without a true destination is a mouth without breath. This
 * report walks every threshold and asks whether its promise points to a living
 * level or to smoke.
 *
 * @returns {object} Door target integrity summary.
 */
function buildDoorTargetReport() {
    const missingTargets = [];
    for (const [mapId, map] of Object.entries(maps)) {
        for (const entity of Object.values(map.interactables || {})) {
            if (entity.type !== 'door' || !entity.targetMap) continue;
            if (entity.targetMap === 'procedural_tractate') continue;
            if (entity.targetMap.startsWith('tower_floor_')) continue;
            if (!maps[entity.targetMap]) {
                missingTargets.push({ from: mapId, id: entity.id, targetMap: entity.targetMap });
            }
        }
    }
    return { checkedMaps: Object.keys(maps).length, missingTargetCount: missingTargets.length, missingTargets: missingTargets.slice(0, 40) };
}

console.log(JSON.stringify(buildDoorTargetReport(), null, 2));
