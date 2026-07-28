// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageMarketOptions.js
 * @description Normalizes modern district options and historic center-sampler-material calls.
 * The Awtsmoos gathers many signatures into one truthful market coordinate and grounded height;
 * Awtsmoos.com lets old and new builders share one contract before timber and canvas enter sight.
 */

import {
	normalizeVillageLandmarkMaterials
} from './VillageLandmarkMaterials.js';

const DEFAULT_CENTER = Object.freeze({ x: -26, z: 12 });

/**
 * Converts either market-builder signature into one complete options object.
 *
 * @param {object} first Modern options or historic center.
 * @param {Function|object} groundSampler Historic terrain sampler.
 * @param {object} materials Historic material URL map.
 * @returns {object} Complete center, base, materials, and preserved modern fields.
 */
export function normalizeVillageMarketOptions(
	first = {},
	groundSampler,
	materials
) {
	if (isModernOptions(first, groundSampler, materials)) {
		const center = normalizeCenter(first.center || first.district?.center);
		return {
			...first,
			base: finiteHeight(first.base, sampleGround(first.groundSampler, center)),
			center,
			materials: normalizeVillageLandmarkMaterials(first.materials)
		};
	}

	const center = normalizeCenter(first);
	return {
		base: sampleGround(groundSampler, center),
		center,
		groundSampler,
		materials: normalizeVillageLandmarkMaterials(materials)
	};
}

function isModernOptions(first, groundSampler, materials) {
	return arguments.length === 1
		|| Boolean(first?.district)
		|| Boolean(first?.materials)
		|| Number.isFinite(Number(first?.base))
		|| (groundSampler === undefined && materials === undefined && !isCenter(first));
}

function normalizeCenter(value) {
	return {
		x: finiteCoordinate(value?.x, DEFAULT_CENTER.x),
		z: finiteCoordinate(value?.z, DEFAULT_CENTER.z)
	};
}

function sampleGround(sampler, center) {
	if (typeof sampler?.heightAt === 'function') {
		return heightValue(sampler.heightAt(center.x, center.z));
	}

	if (typeof sampler === 'function') {
		return heightValue(sampler(center.x, center.z));
	}

	return 0;
}

function heightValue(value) {
	return finiteHeight(value?.y, finiteHeight(value, 0));
}

function finiteHeight(value, fallback) {
	const number = Number(value);

	return Number.isFinite(number) ? number : fallback;
}

function finiteCoordinate(value, fallback) {
	return finiteHeight(value, fallback);
}

function isCenter(value) {
	return Number.isFinite(Number(value?.x)) || Number.isFinite(Number(value?.z));
}
