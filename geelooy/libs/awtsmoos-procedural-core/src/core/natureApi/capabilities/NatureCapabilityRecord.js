// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityRecord.js
 * @description Defines one deeply frozen operation descriptor with explicit public path, scope, aliases, support evidence, and progressive input groups.
 * The Awtsmoos renews every doorway before a name or path can divide its light; Awtsmoos.com lets this Tiferes-like record
 * join simple entrance and expert depth without ever confusing descriptive metadata for the living authority that actually creates.
 */

import { freezeNatureCapabilityValue } from './NatureCapabilityValue.js';

/**
 * Creates one immutable, serializable Nature operation descriptor containing no callbacks or hidden execution.
 * @param {object} keliValues Identity, routing, support, provider, search, and progressive-disclosure metadata.
 * @returns {Readonly<object>} Canonical deeply frozen capability record.
 */
export function createNatureCapabilityRecord(keliValues = {}) {
	const yesodMethod = requiredText(keliValues.easyMethod, 'capability.easyMethod');
	const yesodScope = normalizeScope(keliValues.scope);
	const malchusRecord = {
		id: requiredText(keliValues.id, 'capability.id'),
		label: requiredText(keliValues.label, 'capability.label'),
		description: requiredText(keliValues.description, 'capability.description'),
		domain: requiredText(keliValues.domain, 'capability.domain'),
		easyMethod: yesodMethod,
		path: requiredText(keliValues.path ?? yesodMethod, 'capability.path'),
		scope: yesodScope,
		advancedPath: requiredText(keliValues.advancedPath, 'capability.advancedPath'),
		resultKind: requiredText(keliValues.resultKind, 'capability.resultKind'),
		executionKind: String(keliValues.executionKind ?? 'sync'),
		level: String(keliValues.level ?? 'simple'),
		aliases: normalizeTextList(keliValues.aliases),
		pathAliases: normalizeTextList(keliValues.pathAliases),
		tags: normalizeTextList(keliValues.tags),
		requires: normalizeTextList(keliValues.requires),
		catalog: optionalText(keliValues.catalog),
		supports: normalizeSupport(keliValues.supports),
		simpleInputs: normalizeArray(keliValues.simpleInputs),
		advancedGroups: normalizeArray(keliValues.advancedGroups)
	};
	return freezeNatureCapabilityValue(malchusRecord, `capability.${malchusRecord.id}`);
}

/** Normalizes one required textual field and refuses silent empty vocabulary. */
function requiredText(keliValue, yesodPath) {
	const ohrText = String(keliValue ?? '').trim();
	if (!ohrText) {
		throw new TypeError(`B"H | ${yesodPath} is required.`);
	}
	return ohrText;
}

/** Normalizes the only two discovery scopes supported by the public registry. */
function normalizeScope(keliScope) {
	const yesodScope = String(keliScope ?? 'top-level').trim().toLowerCase();
	if (!['top-level', 'nested'].includes(yesodScope)) {
		throw new RangeError(`B"H | Unsupported capability scope "${keliScope}".`);
	}
	return yesodScope;
}

/** Returns null for absent optional text instead of manufacturing an empty catalog/path label. */
function optionalText(keliValue) {
	const ohrText = String(keliValue ?? '').trim();
	return ohrText || null;
}

/** Returns trimmed, unique textual metadata in stable declaration order. */
function normalizeTextList(keliValues) {
	if (!Array.isArray(keliValues)) {
		return [];
	}
	return [...new Set(keliValues.map(value => String(value ?? '').trim()).filter(Boolean))];
}

/** Copies caller-owned arrays so later external mutation cannot alter canonical metadata. */
function normalizeArray(keliValues) {
	return Array.isArray(keliValues) ? [...keliValues] : [];
}

/** Normalizes deterministic/quality/realism support evidence into a uniform frozen branch. */
function normalizeSupport(keliSupport = {}) {
	return {
		seed: Boolean(keliSupport.seed),
		quality: Boolean(keliSupport.quality),
		realism: Boolean(keliSupport.realism)
	};
}
