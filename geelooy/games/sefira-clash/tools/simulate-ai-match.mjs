#!/usr/bin/env node
//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the simulate ai match vessel in this instant, revealing
 * its focused tools service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { MAPS } from '../js/data/maps.js';
import { simulateMapSet, simulateMatch } from '../js/ai/advanced/test/headlessMatchSimulator.js';

/**
 * B"H
 * CLI for dreaming complete Sefira Clash matches.
 *
 * Chapter 234: the command scroll gains fast mode. Gameplay code is unchanged;
 * the invisible theater simply stops drawing sparks and storing sample scrolls
 * while the bots continue to think, fight, recover, and kill.
 */
const args = parseArgs(process.argv.slice(2));
const frames = Number(args.frames || 1800);
const botCount = Number(args.bots || 5);
const scenario = args.scenario || null;
const fast = !!args.fast;
const sampleEvery = fast ? Number(args.sampleEvery || 0) : Number(args.sampleEvery || 60);
const options = {
	frames,
	botCount,
	scenario,
	sampleEvery,
	fast,
	stopOnWinner: args.stopOnWinner !== 'false'
};
const maps = args.map
	? MAPS.filter(map => map.id === args.map)
	: MAPS.slice(0, Number(args.count || 8));
if (!maps.length) throw new Error(`No map matched ${args.map}`);
const reports = args.map ? [simulateMatch(maps[0], options)] : simulateMapSet(maps, options);
const summary = {
	ok: reports.every(report => report.health.ok),
	frames,
	botCount,
	scenario,
	fast,
	maps: reports.map(summarizeReport),
	reports: args.full ? reports : undefined
};
console.log(JSON.stringify(summary, null, 2));
if (!summary.ok) process.exitCode = 1;

function summarizeReport(report) {
	return {
		map: report.map,
		ok: report.health.ok,
		failures: report.health.failures,
		warnings: report.health.warnings,
		edgeRatio: Math.round(report.health.edgeRatio * 1000) / 1000,
		framesRun: report.framesRun,
		simMs: report.simMs,
		framesPerSecond: report.framesPerSecond,
		attackCommands: report.attackCommands,
		attackCommandsPerMinute: report.attackCommandsPerMinute,
		invalidAttackCommands: report.invalidAttackCommands,
		namelessJumps: report.namelessJumps,
		attackIntent: report.attackIntent,
		storyBeats: report.storyBeats,
		itemsSpawned: report.itemsSpawned,
		itemsPickedUp: report.itemsPickedUp,
		hazardsSpawned: report.hazardsSpawned,
		hazardHits: report.hazardHits,
		objectiveSpawns: report.objectiveSpawns,
		objectiveClaims: report.objectiveClaims,
		scarCount: report.scarCount,
		stageBornPowerups: report.stageBornPowerups,
		stageMood: report.stageMood,
		maxParticles: report.maxParticles,
		damagePerMinute: report.damagePerMinute,
		koCount: report.koCount,
		opportunities: report.opportunities,
		humanIntents: report.humanIntents,
		winner: report.winner
	};
}

function parseArgs(values) {
	const out = {};
	for (let i = 0; i < values.length; i++) {
		const value = values[i];
		if (!value.startsWith('--')) continue;
		const key = value.slice(2);
		const next = values[i + 1];
		if (!next || next.startsWith('--')) out[key] = true;
		else out[key] = values[++i];
	}
	return out;
}
