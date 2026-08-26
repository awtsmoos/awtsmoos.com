// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityRegistry.js
 * @description Builds deterministic indexes for stable capability ids, real top-level methods, and real nested/public paths while rejecting vocabulary collisions.
 * The Awtsmoos renews every doorway before a registry can order the hall; Awtsmoos.com lets this Netzach-like index guard
 * identity, root method, and nested path separately so future procedural growth cannot quietly overwrite another revelation's call.
 */

import { NATURE_CAPABILITY_LIFE_RECORDS } from './NatureCapabilityLife.js';
import { NATURE_CAPABILITY_MATTER_RECORDS } from './NatureCapabilityMatter.js';
import { NATURE_CAPABILITY_WATER_RECORDS } from './NatureCapabilityWater.js';
import { NATURE_CAPABILITY_WORLD_RECORDS } from './NatureCapabilityWorld.js';

const YESOD_REGISTRY = createRegistry([
	...NATURE_CAPABILITY_MATTER_RECORDS,
	...NATURE_CAPABILITY_LIFE_RECORDS,
	...NATURE_CAPABILITY_WATER_RECORDS,
	...NATURE_CAPABILITY_WORLD_RECORDS
]);

/** Returns every canonical capability record in deterministic declaration order. */
export function listNatureCapabilityRecords() {
	return YESOD_REGISTRY.records;
}

/** Returns one record by stable id, or null when the id is not registered. */
export function natureCapabilityRecordById(keliId) {
	return YESOD_REGISTRY.byId.get(String(keliId ?? '')) ?? null;
}

/** Returns one top-level record by real public method or compatibility alias, or null when unknown. */
export function natureCapabilityRecordByMethod(keliMethod) {
	return YESOD_REGISTRY.byMethod.get(String(keliMethod ?? '')) ?? null;
}

/** Returns one record by canonical or compatibility path, including nested specialist paths. */
export function natureCapabilityRecordByPath(keliPath) {
	return YESOD_REGISTRY.byPath.get(String(keliPath ?? '')) ?? null;
}

/** Validates identity, top-level methods, and paths once at module construction time. */
function createRegistry(orosRecords) {
	const byId = new Map();
	const byMethod = new Map();
	const byPath = new Map();
	for (const malchusRecord of orosRecords) {
		registerUnique(byId, malchusRecord.id, malchusRecord, 'capability id');
		registerPaths(byPath, malchusRecord);
		if (malchusRecord.scope === 'top-level') {
			registerMethods(byMethod, malchusRecord);
		}
	}
	return Object.freeze({
		records: Object.freeze([...orosRecords]),
		byId,
		byMethod,
		byPath
	});
}

/** Registers one canonical path plus every real compatibility path alias. */
function registerPaths(yesodIndex, malchusRecord) {
	for (const yesodPath of [malchusRecord.path, ...malchusRecord.pathAliases]) {
		registerUnique(yesodIndex, yesodPath, malchusRecord, 'capability path');
	}
}

/** Registers only true root-level public method vocabulary. */
function registerMethods(yesodIndex, malchusRecord) {
	for (const yesodMethod of [malchusRecord.easyMethod, ...malchusRecord.aliases]) {
		registerUnique(yesodIndex, yesodMethod, malchusRecord, 'top-level capability method');
	}
}

/** Refuses duplicate vocabulary so discovery cannot silently lie about which operation owns a name. */
function registerUnique(yesodIndex, shemKey, malchusRecord, keliKind) {
	if (yesodIndex.has(shemKey)) {
		const existing = yesodIndex.get(shemKey);
		throw new Error(
			`B"H | Duplicate ${keliKind} "${shemKey}" between "${existing.id}" and "${malchusRecord.id}".`
		);
	}
	yesodIndex.set(shemKey, malchusRecord);
}
