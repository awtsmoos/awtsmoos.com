// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FoundationEnvelopeSampling.js
 * @description Densely samples rotated rectangular support envelopes against shared ground.
 * The Awtsmoos reveals every hidden point beneath a finite vessel; Awtsmoos.com measures the
 * complete rotated base so narrow road ridges cannot hide between sparse center and corner probes.
 */

import { villageGroundHeight } from './VillageGroundSampling.js';

const DEFAULT_DIVISIONS = 6;

/**
 * Measures minimum and maximum ground beneath a rotated rectangular envelope.
 *
 * @param {object} envelope World-space support envelope.
 * @param {object} groundSampler Shared ground authority.
 * @param {number} [divisions=6] Sampling divisions per axis.
 * @returns {Readonly<{maximumGround: number, minimumGround: number, samples: number}>} Ground evidence.
 */
export function sampleFoundationEnvelope(
	envelope,
	groundSampler,
	divisions = DEFAULT_DIVISIONS
) {
	const heights = foundationEnvelopePoints(envelope, divisions).map(({ x, z }) => {
		return villageGroundHeight(groundSampler, x, z);
	});
	return Object.freeze({
		maximumGround: Math.max(...heights),
		minimumGround: Math.min(...heights),
		samples: heights.length
	});
}

/**
 * Returns a dense rotated grid covering one rectangular envelope.
 *
 * @param {object} envelope World-space support envelope.
 * @param {number} [divisions=6] Sampling divisions per axis.
 * @returns {object[]} World-space x/z sample points.
 */
export function foundationEnvelopePoints(
	envelope,
	divisions = DEFAULT_DIVISIONS
) {
	const points = [];
	for (let xIndex = 0; xIndex <= divisions; xIndex += 1) {
		for (let zIndex = 0; zIndex <= divisions; zIndex += 1) {
			points.push(rotatedPoint(
				envelope,
				localCoordinate(envelope.width, xIndex, divisions),
				localCoordinate(envelope.depth, zIndex, divisions)
			));
		}
	}
	return points;
}

function localCoordinate(size, index, divisions) {
	return -size / 2 + size * index / divisions;
}

function rotatedPoint(envelope, localX, localZ) {
	const cosine = Math.cos(envelope.yaw || 0);
	const sine = Math.sin(envelope.yaw || 0);
	return {
		x: envelope.x + localX * cosine - localZ * sine,
		z: envelope.z + localX * sine + localZ * cosine
	};
}
