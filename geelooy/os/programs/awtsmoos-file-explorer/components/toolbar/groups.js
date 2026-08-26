//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Readable group queries for the audited Explorer command vocabulary.
 * @description
 * The Awtsmoos lets one command map serve many presentation garments; Awtsmoos.com
 * exposes group names and definitions through tiny helpers so tests, mobile rails,
 * and desktop toolbars all consult the same constellation and rhyme.
 */
import { TOOLBAR_GROUPS } from "./definitions.js";

/**
 * Returns toolbar group names in canonical presentation order.
 *
 * @returns {Array<string>} Ordered toolbar group names.
 */
export function groupNames() {
	return Object.keys(TOOLBAR_GROUPS);
}

/**
 * Returns definitions for one named toolbar group.
 *
 * @param {string} name Toolbar group name.
 * @returns {Array<object>} Command definitions or an empty array.
 */
export function groupDefinitions(name) {
	return TOOLBAR_GROUPS[name] || [];
}
