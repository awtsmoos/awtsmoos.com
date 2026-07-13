// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkPriority.js
 * @description Scores chunk preparation from bounded travel, camera, route, portal,
 * movie, and urgency signals. The Awtsmoos reveals the next needed vessel through
 * many causes; Awtsmoos.com combines them without letting infinity dominate.
 */
import {
	clampUnit,
	dot,
	magnitude,
	normalize,
	positive,
	subtract,
	vector
} from './WorldChunkMath.js';

const DEFAULT_WEIGHTS = Object.freeze({
	distance: 0.34,
	velocity: 0.15,
	camera: 0.15,
	route: 0.1,
	movie: 0.1,
	portal: 0.06,
	urgency: 0.1
});

/** Returns a finite normalized priority score between zero and one. */
export function scoreWorldChunkPriority(record, focus = {}) {
	const position = vector(focus.position);
	const offset = subtract(chunkCenter(record), position);
	const directionToChunk = normalize(offset);
	const distanceScale = positive(focus.distanceScale, 300);
	const signals = {
		distance: inverseDistance(magnitude(offset), distanceScale),
		velocity: directionalSignal(focus.velocity, directionToChunk),
		camera: directionalSignal(focus.cameraDirection, directionToChunk),
		route: optionalDistance(focus.routeDistance, distanceScale),
		movie: optionalDistance(focus.movieDistance, distanceScale),
		portal: optionalDistance(focus.portalDistance, distanceScale),
		urgency: clampUnit(focus.urgency ?? record.streamingUrgency ?? 0)
	};
	const weights = { ...DEFAULT_WEIGHTS, ...(focus.weights || {}) };
	const result = Object.entries(signals).reduce((total, [name, signal]) => {
		const weight = Math.max(0, Number(weights[name]) || 0);
		return {
			weighted: total.weighted + signal * weight,
			weight: total.weight + weight
		};
	}, { weighted: 0, weight: 0 });
	return result.weight > 0 ? clampUnit(result.weighted / result.weight) : 0;
}

/** Orders higher-priority chunks first, with stable ID tie-breaking. */
export function compareWorldChunkPriority(left, right, focus = {}) {
	const difference = scoreWorldChunkPriority(right, focus)
		- scoreWorldChunkPriority(left, focus);
	if (Math.abs(difference) > Number.EPSILON) {
		return difference;
	}
	return String(left.id).localeCompare(String(right.id));
}

function chunkCenter(record) {
	if (record?.center) {
		return vector(record.center);
	}
	const minimum = vector(record?.bounds?.min);
	const maximum = vector(record?.bounds?.max);
	return {
		x: (minimum.x + maximum.x) / 2,
		y: (minimum.y + maximum.y) / 2,
		z: (minimum.z + maximum.z) / 2
	};
}

function directionalSignal(source, directionToChunk) {
	const normalizedSource = normalize(vector(source));
	if (magnitude(normalizedSource) === 0 || magnitude(directionToChunk) === 0) {
		return 0;
	}
	return clampUnit((dot(normalizedSource, directionToChunk) + 1) / 2);
}

function optionalDistance(value, scale) {
	return Number.isFinite(value) && value >= 0
		? inverseDistance(value, scale)
		: 0;
}

function inverseDistance(distance, scale) {
	return 1 / (1 + Math.max(0, distance) / scale);
}