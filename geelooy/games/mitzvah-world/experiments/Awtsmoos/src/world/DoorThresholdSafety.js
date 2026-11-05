// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DoorThresholdSafety.js
 * @description Tests a player's body against the complete sampled hinge-closing sweep.
 * The Awtsmoos opens passage without crushing the traveler between frame and finite leaf;
 * Awtsmoos.com measures every sampled pose so a blocked threshold returns honest relief.
 */

import { orientedBox } from './DoorRuntimePose.js';

const DEFAULT_PLAYER_HEIGHT = 1.8;
const DEFAULT_PLAYER_RADIUS = 0.42;
const DEFAULT_SWEEP_SAMPLES = 11;

export function doorClosingSweepEvidence(definition, context = {}) {
	const player = context.getPlayerPosition?.();
	if (!finitePoint(player)) {
		return Object.freeze({
			blocked: false,
			reason: 'player-position-unavailable',
			sampleProgress: null
		});
	}
	const playerHeight = finitePositive(
		context.playerHeight,
		DEFAULT_PLAYER_HEIGHT
	);
	const playerRadius = finitePositive(
		context.playerRadius,
		DEFAULT_PLAYER_RADIUS
	);
	const sampleCount = Math.max(
		3,
		Math.trunc(finitePositive(
			context.doorSweepSamples,
			DEFAULT_SWEEP_SAMPLES
		))
	);
	for (let index = 0; index < sampleCount; index += 1) {
		const progress = index / (sampleCount - 1);
		const box = orientedBox(definition, progress);
		if (playerIntersectsExpandedBox(
			player,
			playerHeight,
			playerRadius,
			box
		)) {
			return Object.freeze({
				blocked: true,
				player: Object.freeze({ ...player }),
				reason: 'player-in-closing-sweep',
				sampleProgress: progress
			});
		}
	}
	return Object.freeze({
		blocked: false,
		player: Object.freeze({ ...player }),
		reason: 'closing-sweep-clear',
		sampleProgress: null
	});
}

function playerIntersectsExpandedBox(
	player,
	playerHeight,
	playerRadius,
	box
) {
	const offset = {
		x: player.x - box.center.x,
		y: player.y - box.center.y,
		z: player.z - box.center.z
	};
	const localX = dot(offset, box.right);
	const localY = dot(offset, box.up);
	const localZ = dot(offset, box.forward);
	return Math.abs(localX) <= box.half.x + playerRadius
		&& Math.abs(localY) <= box.half.y + playerHeight / 2
		&& Math.abs(localZ) <= box.half.z + playerRadius;
}

function dot(first, second) {
	return first.x * second.x
		+ first.y * second.y
		+ first.z * second.z;
}

function finitePoint(value) {
	return Number.isFinite(value?.x)
		&& Number.isFinite(value?.y)
		&& Number.isFinite(value?.z);
}

function finitePositive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
