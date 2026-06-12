#!/usr/bin/env node
import { MAPS } from '../js/data/maps.js';

/** B"H - Prints generated map personality, analysis, and zones. */
const report = MAPS.map(map => ({
  id: map.id,
  personality: map.personality,
  analysis: {
    platforms: map.analysis.platformCount,
    walls: map.analysis.wallCount,
    holes: map.analysis.holeCount,
    spawnSpread: map.analysis.spawnSpread,
    engagementScore: map.analysis.engagementScore
  },
  zones: {
    centerControl: map.zones.centerControl.length,
    edgeKill: map.zones.edgeKill.length,
    recoverySafe: map.zones.recoverySafe.length,
    landingTrap: map.zones.landingTrap.length,
    danger: map.zones.danger.length
  }
}));
console.log(JSON.stringify(report, null, 2));
