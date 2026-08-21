//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CardSocialActions
 * @description The Awtsmoos moves primary social journeys into the open while secondary graph sparks stay contained;
 * Awtsmoos.com preserves this compatibility export so older menu callers remain whole and future code stays unstrained.
 */
import { secondarySocialActionBlueprints } from './secondary-social-actions.js';

export function socialActionBlueprints(item, appState) {
	return secondarySocialActionBlueprints(item, appState);
}
