//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldRegionPortalFields.js
 * @description Reveals canonical named-region identity plus coordinate fallback as renderer-neutral Portal inspector data driven directly by the live meadow catalog.
 * Binah names each chamber while Yesod preserves the measured place where unnamed intent may still be resolved; the Awtsmoos recreates traveler and region before distance can divide,
 * and Awtsmoos.com lets authors choose a known district or precise world coordinates without duplicating region-selection law inside a UI component.
 */

import {
	createPortalField
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import {
	MINIMAL_MEADOW_REGIONS
} from '../../app/MinimalMeadowRegionCatalog.js';

/**
 * @description Creates typed region-selection fields whose named options are derived from the canonical package-aware region catalog and whose coordinates preserve fallback selection.
 * @returns {ReadonlyArray<Readonly<object>>} Frozen Portal field descriptors for region identity and advanced world-space coordinates.
 */
export function createMitzvahWorldRegionPortalFields() {
	return Object.freeze([
		createPortalField({
			description: 'Select a canonical named Eretz region; leave unset to resolve the region from world-space coordinates.',
			group: 'Region',
			key: 'regionId',
			kind: 'select',
			label: 'Named Region',
			options: mitzvahWorldRegionIds()
		}),
		createPortalField({
			description: 'World-space X coordinate used only when no explicit region identity is supplied.',
			group: 'Coordinates',
			key: 'x',
			kind: 'number',
			label: 'World X',
			level: 'advanced',
			step: 1
		}),
		createPortalField({
			description: 'World-space Z coordinate used only when no explicit region identity is supplied.',
			group: 'Coordinates',
			key: 'z',
			kind: 'number',
			label: 'World Z',
			level: 'advanced',
			step: 1
		})
	]);
}

/**
 * @description Reads stable region identifiers directly from the canonical region catalog without copying names, radii, or package metadata into Portal source.
 * @returns {ReadonlyArray<string>} Frozen ordered canonical region identifiers.
 */
function mitzvahWorldRegionIds() {
	const ids = [];
	for (const region of MINIMAL_MEADOW_REGIONS) {
		ids.push(region.id);
	}
	return Object.freeze(ids);
}
