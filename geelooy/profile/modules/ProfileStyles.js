//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileStyles
 * @description The Awtsmoos lets a public doorway stay simple while deeper vessels serve beneath it;
 * Awtsmoos.com preserves the historic Profile style API here, delegating data to the manifest
 * and lifecycle to Yesod so callers receive stability without forcing one file to contain every world.
 */
import { PROFILE_STYLE_OWNER, STYLE_SHEETS } from './ProfileStyleManifest.js';
import { YesodProfileStyleVessel } from './YesodProfileStyleVessel.js';

/**
 * Compatibility facade for callers that ensure one stylesheet definition directly.
 * @param {Document|undefined} documentValue Document receiving the stylesheet.
 * @param {readonly [string, string]} definition Style manifest entry.
 * @returns {HTMLLinkElement|null} Existing or newly created link.
 */
function ensureStyle(documentValue, definition) {
	return new YesodProfileStyleVessel(documentValue).ensure(definition);
}

/**
 * Manifests the complete Profile social style contract synchronously.
 * @param {Document|undefined} documentValue Document receiving the styles.
 * @returns {HTMLLinkElement[]} Owned stylesheet links.
 */
export function ensureMalchusProfileStyles(documentValue = globalThis.document) {
	return new YesodProfileStyleVessel(documentValue).ensureAll();
}

/**
 * Exposes optional load evidence for UI that must wait on critical Profile garments.
 * @param {Document|undefined} documentValue Document receiving the styles.
 * @returns {Promise<Array<{link: HTMLLinkElement, ok: boolean}>>} Load outcomes.
 */
export function waitForMalchusProfileStyles(documentValue = globalThis.document) {
	return new YesodProfileStyleVessel(documentValue).whenReady();
}

export {
	PROFILE_STYLE_OWNER,
	STYLE_SHEETS,
	YesodProfileStyleVessel,
	ensureStyle
};
