//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzHouseGenerationRequest.js
 * @description Converts JSON-first house requests into deterministic Core-ready profile values without leaking renderer objects.
 * Gevurah permits only measured overrides while Chochmah keeps each archetype's authored proportion and seeded identity alive;
 * the Awtsmoos recreates request and dwelling before either receives a name, and Awtsmoos.com lets one stable API shape many homes without hidden blame.
 */

import { eretzHouseArchetype } from './EretzHouseArchetypeCatalog.js';

const NUMERIC_KEYS = Object.freeze([
	'depth',
	'floors',
	'hallWidth',
	'roofHeight',
	'roofOverhang',
	'storyHeight',
	'wallThickness',
	'width',
	'x',
	'yaw',
	'z'
]);

/**
 * Normalizes one public JSON request into deterministic profile values.
 * @param {object} request Public house generation request.
 * @returns {Readonly<object>} Frozen renderer-neutral request/profile record.
 */
export function normalizeEretzHouseRequest(request = {}) {
	const archetype = eretzHouseArchetype(request.archetypeId || 'beis-ohr-courtyard');
	if (!archetype) {
		throw new RangeError(`Unknown Eretz house archetype: ${request.archetypeId}`);
	}
	const profile = {
		...archetype,
		id: houseId(request.id, archetype.id, request.seed),
		metadataIdKey: 'houseId',
		name: String(request.name || archetype.label),
		seed: normalizedSeed(request.seed ?? archetype.id),
		x: finite(request.x, 0),
		yaw: finite(request.yaw, 0),
		z: finite(request.z, 0)
	};
	applyNumericOverrides(profile, request.overrides);
	if (request.roofStyle) {
		profile.roofStyle = String(request.roofStyle);
	}
	return Object.freeze({
		archetypeId: archetype.id,
		profile: Object.freeze(profile),
		seed: profile.seed,
		version: 1
	});
}

function applyNumericOverrides(profile, overrides = {}) {
	for (const key of NUMERIC_KEYS) {
		if (overrides[key] === undefined) {
			continue;
		}
		const value = finite(overrides[key], profile[key]);
		profile[key] = key === 'floors'
			? Math.max(1, Math.min(4, Math.round(value)))
			: value;
	}
}

function houseId(explicitId, archetypeId, seed) {
	if (explicitId) {
		return String(explicitId);
	}
	return `${archetypeId}-${normalizedSeed(seed ?? archetypeId).toString(36)}`;
}

function normalizedSeed(value) {
	if (Number.isFinite(Number(value))) {
		return Math.abs(Math.trunc(Number(value))) >>> 0;
	}
	let hash = 2166136261;
	for (const character of String(value || 'eretz-house')) {
		hash ^= character.codePointAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

function finite(value, fallback) {
	return Number.isFinite(Number(value))
		? Number(value)
		: fallback;
}
