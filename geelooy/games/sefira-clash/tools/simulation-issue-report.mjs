#!/usr/bin/env node
//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the simulation issue report vessel in this instant, revealing
 * its focused tools service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { MAPS } from '../js/data/maps.js';
import { simulateMatch } from '../js/ai/advanced/test/headlessMatchSimulator.js';

/** B"H - Reports simulation smells plus cluster/resource ecosystem signals. */
const frames = Number(arg('--frames') || 900),
	bots = Number(arg('--bots') || 4);
const maps = arg('--map')
	? MAPS.filter(m => m.id === arg('--map'))
	: MAPS.slice(0, Number(arg('--count') || 3));
const rows = maps.map(map => {
	const r = simulateMatch(map, { frames, botCount: bots, fast: true, stopOnWinner: false });
	const edgeCarry = r.attackIntent?.koIntents?.EdgeCarry || 0;
	const totalIntent =
		Object.values(r.attackIntent?.koIntents || {}).reduce((a, b) => a + b, 0) || 1;
	return {
		map: map.id,
		ok: r.health.ok,
		warnings: r.health.warnings,
		dpm: r.damagePerMinute,
		kos: r.koCount,
		quietFrames: r.quietFrames,
		storyBeats: r.storyBeats,
		objectives: `${r.objectiveClaims || 0}/${r.objectiveSpawns || 0}`,
		items: `${r.itemsPickedUp || 0}/${r.itemsSpawned || 0}`,
		edgeCarryRatio: round(edgeCarry / totalIntent),
		mood: r.stageMood?.personality,
		invalid: r.invalidAttackCommands,
		attackCommands: r.attackCommands,
		routeFailures: r.routeFailures || 0
	};
});
console.log(
	JSON.stringify({ ok: rows.every(r => r.ok && !r.invalid), frames, bots, rows }, null, 2)
);
function arg(name) {
	const i = process.argv.indexOf(name);
	return i >= 0 ? process.argv[i + 1] : null;
}
function round(v) {
	return Math.round(v * 100) / 100;
}
