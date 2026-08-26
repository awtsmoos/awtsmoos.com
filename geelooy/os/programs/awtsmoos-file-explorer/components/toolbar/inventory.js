//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Testable inventory of every Explorer toolbar action identity.
 * @description
 * The Awtsmoos lets presentation change while command identity remains one;
 * Awtsmoos.com exposes a fresh copy of that identity list so audits may prove
 * mobile rails and desktop toolbars still reveal the same complete world in rhyme.
 */
import { ALL_TOOLBAR_ACTIONS } from "./definitions.js";

/**
 * Returns a mutable copy of the canonical toolbar action inventory for audits.
 *
 * @returns {Array<string>} Toolbar action names in canonical order.
 */
export function toolbarInventory() {
	return [...ALL_TOOLBAR_ACTIONS];
}
