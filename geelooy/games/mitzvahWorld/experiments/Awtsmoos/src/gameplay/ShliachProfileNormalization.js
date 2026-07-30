// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShliachProfileNormalization.js
 * @description Migrates old Shliach saves into bounded attributes, loadouts, powerups, and schema.
 * The Awtsmoos renews the present without erasing one earned spark from yesterday;
 * Awtsmoos.com gives every older save new vessels while preserving its honest way.
 */

import {
	SHLIACH_ATTRIBUTES,
	defaultShliachAttributes
} from './ShliachProfileCatalog.js';

export const PROFILE_SCHEMA_VERSION = 2;
export const PROFILE_KEYS = Object.freeze([
	'activePowerups',
	'affinityLoadout',
	'attributes',
	'level',
	'mitzvahPoints',
	'perutas',
	'schemaVersion',
	'unspentPoints',
	'xp'
]);

const AFFINITY_IDS = Object.freeze([
	'chochmah',
	'binah',
	'zeir-anpin',
	'malchus'
]);
const LOADOUT_ACTION_LIMIT = 8;

export function normalizedShliachProfile(overrides = {}) {
	const source = structuredClone(overrides || {});
	return {
		activePowerups: normalizedPowerups(source.activePowerups),
		affinityLoadout: normalizedAffinityLoadout(source.affinityLoadout),
		attributes: normalizedAttributes(source.attributes),
		level: positiveInteger(source.level, 1),
		mitzvahPoints: nonNegativeInteger(source.mitzvahPoints),
		perutas: finiteOrNull(source.perutas),
		schemaVersion: PROFILE_SCHEMA_VERSION,
		unspentPoints: nonNegativeInteger(source.unspentPoints ?? 3),
		xp: nonNegativeInteger(source.xp)
	};
}

export function normalizedAffinityLoadout(value = {}) {
	return {
		actionIds: [...new Set(Array.isArray(value.actionIds) ? value.actionIds : [])]
			.filter(validActionId)
			.slice(0, LOADOUT_ACTION_LIMIT),
		selectedAffinityId: AFFINITY_IDS.includes(value.selectedAffinityId)
			? value.selectedAffinityId
			: 'chochmah'
	};
}

export function knownAffinityId(affinityId) {
	return AFFINITY_IDS.includes(affinityId);
}

function normalizedAttributes(values = {}) {
	const defaults = defaultShliachAttributes();
	for (const key of Object.keys(defaults)) {
		const value = Number(values[key]);
		defaults[key] = Number.isFinite(value)
			? clamp(value, 0, SHLIACH_ATTRIBUTES[key].maximum)
			: defaults[key];
	}
	return defaults;
}

function normalizedPowerups(value) {
	return value && typeof value === 'object' ? structuredClone(value) : {};
}

function validActionId(actionId) {
	return typeof actionId === 'string' && Boolean(actionId.trim());
}

function nonNegativeInteger(value) {
	return Math.max(0, Math.trunc(Number(value) || 0));
}

function positiveInteger(value, fallback) {
	return Math.max(1, Math.trunc(Number(value) || fallback));
}

function finiteOrNull(value) {
	if (value === null || value === undefined || value === '') return null;
	return Number.isFinite(Number(value)) ? Number(value) : null;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
