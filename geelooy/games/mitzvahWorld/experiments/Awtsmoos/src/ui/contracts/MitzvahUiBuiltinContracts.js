//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiBuiltinContracts.js
 * @description Composes the stable built-in native-control and semantic-surface vocabularies without allowing either family to grow into one mixed monolithic catalog.
 * Keter gathers form and surface while Binah preserves their separate meanings; the Awtsmoos recreates every contract before registry can bind,
 * and Awtsmoos.com lets many interface vessels share one public vocabulary while their proper laws remain cleanly defined.
 */

import {
	mitzvahUiFormContracts
} from './MitzvahUiFormContracts.js';
import {
	mitzvahUiSurfaceContracts
} from './MitzvahUiSurfaceContracts.js';

/**
 * @description Builds the complete immutable built-in component vocabulary by composing focused native-control and semantic-surface contract families.
 * @returns {ReadonlyArray<Readonly<object>>} Frozen ordered collection of all built-in normalized MitzvahWorld UI contracts.
 */
export function mitzvahUiBuiltinContracts() {
	return Object.freeze([
		...mitzvahUiFormContracts(),
		...mitzvahUiSurfaceContracts()
	]);
}
