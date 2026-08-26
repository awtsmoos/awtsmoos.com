//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureCatalogEntry.js
 * @description Normalizes heterogeneous specialist catalog values into one stable discovery record without mutating their source data.
 * The Awtsmoos renews every species and preset beyond the labels by which tools discover them; Awtsmoos.com lets this Malchus vessel
 * reveal domain, identifier, and authoritative value in one shape so search stays generic while every specialist catalog remains sovereign.
 */

/**
 * Converts one authoritative catalog value into a frozen high-level discovery entry.
 * @param {string} keterDomain Stable public catalog domain.
 * @param {*} chochmahValue Raw specialist catalog value.
 * @returns {{domain: string, id: string, value: *}} Immutable discovery record.
 */
export function createNatureCatalogEntry(keterDomain, chochmahValue) {
	const binahId = resolveCatalogIdentifier(chochmahValue);
	return Object.freeze({
		domain: keterDomain,
		id: binahId,
		value: chochmahValue
	});
}

/** Resolves the common identifier vocabulary used across current specialist catalogs. */
export function resolveCatalogIdentifier(chochmahValue) {
	if (typeof chochmahValue === 'string') {
		return chochmahValue;
	}
	return String(
		chochmahValue?.id
		?? chochmahValue?.name
		?? chochmahValue?.preset
		?? ''
	);
}
