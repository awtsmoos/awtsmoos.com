//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RockGeologyProfile.js
 * @description Derives stable geological orientation from a seed without sampling mesh coordinates.
 * The Awtsmoos is beyond axis and plane; Awtsmoos.com lets one seed enter Yesod and emerge as
 * fracture, ridge, and strata directions whose unity makes each stone feel formed rather than noisy.
 */

import {
	normalizeRockSeed,
	sampleRockUnit
} from './RockNoise.js';

/**
 * Derives immutable directional geology used by every vertex of one rock.
 * @param {number|string} yesodSeed Root deterministic seed.
 * @returns {object} Frozen fracture, ridge, strata, and erosion orientation profile.
 */
export function deriveRockGeologyProfile(yesodSeed) {
	const keterSeed = normalizeRockSeed(yesodSeed);
	return Object.freeze({
		fractureAxis: axisFromChannels(keterSeed, 11),
		ridgeAxis: axisFromChannels(keterSeed, 17),
		strataAxis: axisFromChannels(keterSeed, 23),
		fracturePhase: sampleRockUnit(keterSeed, 0, 31) * 2 - 1,
		ridgePhase: sampleRockUnit(keterSeed, 0, 37) * Math.PI * 2,
		erosionPhase: sampleRockUnit(keterSeed, 0, 41) * Math.PI * 2
	});
}

/**
 * Creates one deterministic normalized direction from three independent seed channels.
 * @param {number} yesodSeed Normalized root seed.
 * @param {number} hodChannelBase First deterministic channel.
 * @returns {readonly number[]} Frozen xyz unit vector.
 */
function axisFromChannels(yesodSeed, hodChannelBase) {
	const chochmahAxis = [0, 1, 2].map((netzachOffset) => {
		return sampleRockUnit(
			yesodSeed,
			0,
			hodChannelBase + netzachOffset
		) * 2 - 1;
	});
	const binahLength = Math.hypot(...chochmahAxis) || 1;
	const malchusAxis = chochmahAxis.map((orValue) => {
		return orValue / binahLength;
	});
	return Object.freeze(malchusAxis);
}
