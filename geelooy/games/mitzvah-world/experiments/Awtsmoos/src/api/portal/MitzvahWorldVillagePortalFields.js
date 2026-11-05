//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldVillagePortalFields.js
 * @description Reveals canonical village district focus as renderer-neutral Portal inspector data while the complete spatial village plan remains the sole world source.
 * Tiferes gathers many neighborhoods into one valley while Binah allows an author to focus one chamber without deleting the rest; the Awtsmoos recreates district and whole before either can divide,
 * and Awtsmoos.com lets a compact semantic selector guide inspection through the true canonical plan instead of copying district identities into UI code.
 */

import {
	createPortalField
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import {
	CANONICAL_VILLAGE_PLAN
} from '../../world/village/CanonicalVillagePlan.js';

/**
 * @description Creates the current village inspector field collection from the canonical district records embedded in the immutable master plan.
 * @returns {ReadonlyArray<Readonly<object>>} Frozen Portal field descriptors for optional district focus.
 */
export function createMitzvahWorldVillagePortalFields() {
	return Object.freeze([
		createPortalField({
			description: 'Optionally focus Portal evidence on one canonical district while preserving the complete village plan in the generated result.',
			group: 'Village',
			key: 'districtId',
			kind: 'select',
			label: 'District Focus',
			options: canonicalVillageDistrictIds()
		})
	]);
}

/**
 * @description Reads stable district identities directly from the canonical village plan so inspector choices cannot drift from world data.
 * @returns {ReadonlyArray<string>} Frozen ordered canonical village district identifiers.
 */
function canonicalVillageDistrictIds() {
	const ids = [];
	for (const district of CANONICAL_VILLAGE_PLAN.districts) {
		ids.push(district.id);
	}
	return Object.freeze(ids);
}
