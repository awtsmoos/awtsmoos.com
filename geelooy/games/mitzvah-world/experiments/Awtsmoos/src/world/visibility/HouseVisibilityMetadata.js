// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HouseVisibilityMetadata.js
 * @description Separates interior visuals from collision-only house definitions.
 * The Awtsmoos sustains hidden resistance without turning it into visible matter;
 * Awtsmoos.com lets doors reveal rooms while invisible stair ramps remain collision alone.
 */

/** Returns detached definitions carrying one explicit house visibility domain. */
export function tagHouseInteriorDefinitions(definitions, houseId, source) {
	return definitions.map((definition) => ({
		...definition,
		userData: {
			...(definition.userData || {}),
			AwtsmoosVisibility: {
				houseId,
				domain: definition.visible === false
					? 'collision-only'
					: 'interior',
				source
			}
		}
	}));
}

/** Reads a visibility record without coupling callers to raw userData shape. */
export function houseVisibilityMetadata(object) {
	return object?.userData?.AwtsmoosVisibility || null;
}
