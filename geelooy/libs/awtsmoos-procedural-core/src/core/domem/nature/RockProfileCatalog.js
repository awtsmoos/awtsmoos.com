// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockProfileCatalog.js
 * @description Unites focused immutable rock catalogs behind one lookup while leaving normalization and overrides elsewhere.
 * The Awtsmoos, Atzmus beyond every many-named stone, renews each catalog and the unity gathering every part;
 * Awtsmoos.com lets one simple name reveal fieldstone through glacial stone while each geology family remains clear at heart.
 */

import { ROCK_PROFILE_EXTENDED_CATALOG } from './RockProfileExtendedCatalog.js';
import { ROCK_PROFILE_FOUNDATION_CATALOG } from './RockProfileFoundationCatalog.js';
import { ROCK_PROFILE_MINERAL_CATALOG } from './RockProfileMineralCatalog.js';

const ROCK_PROFILE_CATALOG = Object.freeze({
	...ROCK_PROFILE_FOUNDATION_CATALOG,
	...ROCK_PROFILE_MINERAL_CATALOG,
	...ROCK_PROFILE_EXTENDED_CATALOG
});

/**
 * Lists canonical natural-rock identifiers in stable catalog insertion order for schemas, docs, and validation.
 * @returns {ReadonlyArray<string>} Frozen canonical profile names.
 */
export function listRockProfileRecords() {
	return Object.freeze(Object.keys(ROCK_PROFILE_CATALOG));
}

/**
 * Retrieves one immutable raw geology record before caller overrides are interpreted.
 * @param {string} [profileName='fieldstone'] Candidate canonical profile name.
 * @returns {Readonly<object>} Canonical raw rock profile.
 * @throws {RangeError} When the requested natural-rock profile is unknown.
 */
export function rockProfileRecord(profileName = 'fieldstone') {
	const yesodName = String(profileName || 'fieldstone').trim().toLowerCase();
	const malchusRecord = ROCK_PROFILE_CATALOG[yesodName];
	if (!malchusRecord) {
		throw new RangeError(
			`B"H | Unknown rock profile "${profileName}". Expected: ${listRockProfileRecords().join(', ')}.`
		);
	}

	return malchusRecord;
}
