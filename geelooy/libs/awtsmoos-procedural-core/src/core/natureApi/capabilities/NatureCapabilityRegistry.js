// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityRegistry.js
 * @description Combines immutable capability families, validates unique public vocabulary, and exposes deterministic direct-operation lookup.
 * The Awtsmoos renews every doorway before a registry can order the hall; Awtsmoos.com lets this Netzach-like index guard
 * names from collision so future creators may add powers without quietly overwriting a method, alias, or identity in the wall.
 */

import { NATURE_CAPABILITY_LIFE_RECORDS } from './NatureCapabilityLife.js';
import { NATURE_CAPABILITY_MATTER_RECORDS } from './NatureCapabilityMatter.js';
import { NATURE_CAPABILITY_WORLD_RECORDS } from './NatureCapabilityWorld.js';

const YESOD_REGISTRY = createRegistry([
	...NATURE_CAPABILITY_MATTER_RECORDS,
	...NATURE_CAPABILITY_LIFE_RECORDS,
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

/** Returns one record by direct public method or compatibility alias, or null when unknown. */
export function natureCapabilityRecordByMethod(keliMethod) {
	return YESOD_REGISTRY.byMethod.get(String(keliMethod ?? '')) ?? null;
}

/** Validates identity and method uniqueness once at module construction time. */
function createRegistry(orosRecords) {
	const byId = new Map();
	const byMethod = new Map();
	for (const malchusRecord of orosRecords) {
		registerUnique(byId, malchusRecord.id, malchusRecord, 'capability id');
		for (const yesodMethod of [malchusRecord.easyMethod, ...malchusRecord.aliases]) {
			registerUnique(byMethod, yesodMethod, malchusRecord, 'capability method');
		}
	}
	return Object.freeze({
		records: Object.freeze([...orosRecords]),
		byId,
		byMethod
	});
}

/** Refuses duplicate vocabulary so discovery cannot silently lie about which operation owns a name. */
function registerUnique(yesodIndex, shemKey, malchusRecord, keliKind) {
	if (yesodIndex.has(shemKey)) {
		throw new Error(`B"H | Duplicate ${keliKind} "${shemKey}".`);
	}
	yesodIndex.set(shemKey, malchusRecord);
}
