#!/usr/bin/env node
import { MAPS } from '../js/data/maps.js';
import { simulateMatch } from '../js/ai/advanced/test/headlessMatchSimulator.js';

/** B"H - Map quality audit: engagement, quiet, damage, and route sanity. */
const frames = Number(arg('--frames') || 1200);
const bots = Number(arg('--bots') || 5);
const maps = arg('--map') ? MAPS.filter(m => m.id === arg('--map')) : MAPS;
const reports = maps.map(map => {
  const sim = simulateMatch(map, { frames, botCount: bots, fast: true, stopOnWinner: false });
  return {
    map: map.id,
    quality: quality(map, sim),
    engagementScore: map.analysis.engagementScore,
    spawnSpread: map.analysis.spawnSpread,
    personality: map.personality,
    zones: { center: map.zones.centerControl.length, edge: map.zones.edgeKill.length, trap: map.zones.landingTrap.length },
    damagePerMinute: sim.damagePerMinute,
    koCount: sim.koCount,
    warnings: sim.health.warnings,
    failures: sim.health.failures,
    attackCommands: sim.attackCommands,
    invalidAttackCommands: sim.invalidAttackCommands
  };
});
console.log(JSON.stringify({ ok: reports.every(r => !r.failures.length && !r.invalidAttackCommands), frames, bots, maps: reports }, null, 2));

function quality(map, sim) {
  const combat = Math.min(100, (sim.damagePerMinute || 0) * 0.38 + (sim.koCount || 0) * 8);
  const engagement = Math.min(100, map.analysis.engagementScore / 10);
  const zones = Math.min(100, (map.zones.centerControl.length + map.zones.edgeKill.length + map.zones.landingTrap.length) * 4);
  const penalty = (sim.health.warnings?.length || 0) * 12 + (sim.invalidAttackCommands || 0) * 5;
  return Math.round(Math.max(0, combat * 0.45 + engagement * 0.3 + zones * 0.25 - penalty));
}
function arg(name) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; }
