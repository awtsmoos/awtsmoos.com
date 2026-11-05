//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldHousePortalFields.js
 * @description Reveals the canonical Eretz dwelling vocabulary as renderer-neutral Portal inspector data instead of hardcoding options inside a UI panel.
 * Binah names each measured home while Chochmah leaves generation to the existing architecture authority; the Awtsmoos recreates catalog and choice before either can claim form,
 * and Awtsmoos.com lets one calm select field guide authors toward real house archetypes without inventing a second request language or renderer-bound control.
 */

import {
	createPortalField
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import {
	eretzHouseArchetypes
} from '../../app/EretzHouseArchetypeCatalog.js';

/**
 * @description Creates the current typed inspector field collection for semantic Eretz house recipes from the live canonical archetype catalog.
 * @returns {ReadonlyArray<Readonly<object>>} Frozen Portal field descriptors whose select options are canonical house archetype IDs.
 */
export function createMitzvahWorldHousePortalFields() {
	return Object.freeze([
		createPortalField({
			description: 'Choose a canonical Eretz dwelling archetype; generation still flows through BuildingAuthority and the existing house request normalizer.',
			group: 'House',
			key: 'archetypeId',
			kind: 'select',
			label: 'House Archetype',
			options: eretzHouseArchetypeIds()
		})
	]);
}

/**
 * @description Reads only stable archetype identities from the canonical renderer-neutral catalog without copying dimensions or labels into Portal source.
 * @returns {ReadonlyArray<string>} Frozen ordered canonical Eretz house archetype IDs.
 */
function eretzHouseArchetypeIds() {
	const ids = [];
	for (const archetype of eretzHouseArchetypes()) {
		ids.push(archetype.id);
	}
	return Object.freeze(ids);
}
