// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityRecord.js
 * @description Normalizes direct Nature operation metadata into one immutable progressive-disclosure vocabulary aligned with Reality capability records.
 * The Awtsmoos renews easy doorway and expert path from one indivisible source; Awtsmoos.com gives each capability a truthful
 * name, domain, result, support law, and advanced route so discovery illuminates execution without becoming a second executor of force.
 */

import { freezeNatureCapabilityValue } from './NatureCapabilityValue.js';

/**
 * Creates one immutable operation capability record containing no callbacks or executable behavior.
 * @param {object} keliValues Capability identity, paths, support flags, search tags, and progressive input metadata.
 * @returns {Readonly<object>} Deeply frozen serializable record.
 */
export function createNatureCapabilityRecord(keliValues = {}) {
	const malchusRecord = {
		id: requiredText(keliValues.id, 'capability.id'),
		label: requiredText(keliValues.label, 'capability.label'),
		description: requiredText(keliValues.description, 'capability.description'),
		domain: requiredText(keliValues.domain, 'capability.domain'),
		easyMethod: requiredText(keliValues.easyMethod, 'capability.easyMethod'),
		advancedPath: requiredText(keliValues.advancedPath, 'capability.advancedPath'),
		resultKind: requiredText(keliValues.resultKind, 'capability.resultKind'),
		executionKind: String(keliValues.executionKind ?? 'sync'),
		level: String(keliValues.level ?? 'simple'),
		aliases: normalizeTextList(keliValues.aliases),
		tags: normalizeTextList(keliValues.tags),
		requires: normalizeTextList(keliValues.requires),
		catalog: normalizeOptionalText(keliValues.catalog),
		supports: {
			seed: Boolean(keliValues.supports?.seed),
			quality: Boolean(keliValues.supports?.quality),
			realism: Boolean(keliValues.supports?.realism)
		},
		simpleInputs: Array.isArray(keliValues.simpleInputs) ? keliValues.simpleInputs : [],
		advancedGroups: Array.isArray(keliValues.advancedGroups) ? keliValues.advancedGroups : []
	};
	return freezeNatureCapabilityValue(malchusRecord, `capability.${malchusRecord.id}`);
}

/** Normalizes one required textual capability field. */
function requiredText(keliValue, yesodPath) {
	const ohrText = String(keliValue ?? '').trim();
	if (!ohrText) {
		throw new TypeError(`B"H | ${yesodPath} is required.`);
	}
	return ohrText;
}

/** Normalizes an optional textual link without inventing empty catalog names. */
function normalizeOptionalText(keliValue) {
	if (keliValue === undefined || keliValue === null || String(keliValue).trim() === '') {
		return null;
	}
	return String(keliValue).trim();
}

/** Returns a trimmed, unique, stable string list for aliases, tags, and requirements. */
function normalizeTextList(keliValues) {
	if (!Array.isArray(keliValues)) {
		return [];
	}
	const orosValues = keliValues
		.map(keliValue => String(keliValue ?? '').trim())
		.filter(Boolean);
	return [...new Set(orosValues)];
}
