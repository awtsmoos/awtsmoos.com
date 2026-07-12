// B"H
import { dailyKey } from '../modes/daily.js';

export function recordCapture(world, object) {
	const telemetry = world.telemetry;
	telemetry.captures += 1;
	telemetry.largestCapture = Math.max(telemetry.largestCapture, object.mass);
	telemetry.maxChain = Math.max(telemetry.maxChain, world.districtChain);
	telemetry.districts[object.district] = true;
	telemetry.districtCount = Object.keys(telemetry.districts).length;
	world.save.collection[object.category] = (world.save.collection[object.category] || 0) + 1;
}

export function recordRivalDefeat(world) {
	world.telemetry.rivalsEaten += 1;
}

export function recordRound(world, won) {
	const id = world.gameMode.id;
	const previous = world.save.modeRecords[id] || {};
	world.save.modeRecords[id] = {
		plays: (previous.plays || 0) + 1,
		wins: (previous.wins || 0) + Number(won),
		bestScore: Math.max(previous.bestScore || 0, world.score),
		bestMass: Math.max(previous.bestMass || 0, world.player.mass),
		bestRank: Math.min(previous.bestRank || Infinity, world.rank)
	};
	if (world.gameMode.daily) recordDaily(world, won);
}

function recordDaily(world, won) {
	const key = dailyKey();
	const previous = world.save.daily[key] || {};
	world.save.daily[key] = {
		attempts: (previous.attempts || 0) + 1,
		wins: (previous.wins || 0) + Number(won),
		bestScore: Math.max(previous.bestScore || 0, world.score)
	};
}
