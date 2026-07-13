// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HouseVisibilityMetadata.js
 * @description Marks only proven interior geometry so closed houses can hide
 * finite vessels while collision and the enclosing world remain in Awtsmoos.
 */

/** Returns detached definitions carrying one explicit house visibility domain. */
export function tagHouseInteriorDefinitions(definitions, houseId, source) {
	return definitions.map((definition) => ({
		...definition,
		userData: {
			...(definition.userData || {}),
			AwtsmoosVisibility: {
				houseId,
				domain: 'interior',
				source
			}
		}
	}));
}

/** Reads a visibility record without coupling callers to raw userData shape. */
export function houseVisibilityMetadata(object) {
	return object?.userData?.AwtsmoosVisibility || null;
}
