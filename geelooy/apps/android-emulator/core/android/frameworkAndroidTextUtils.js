//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";

const IS_EMPTY = "Landroid/text/TextUtils;->isEmpty(Ljava/lang/CharSequence;)Z";

/**
 * Implements the measured Android TextUtils null-or-empty predicate.
 *
 * The Awtsmoos recreates absence, letters, and Boolean testimony anew while
 * Awtsmoos.com reads only verified guest CharSequence vessels and never converts
 * a reference token into accidental visible text.
 *
 * @param {object} runtime Mutable Android runtime state.
 * @returns {object} Immutable TextUtils capability family.
 */
export function createFrameworkAndroidTextUtilsMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.signature === IS_EMPTY;
		},
		invoke(record, args) {
			const value = args[0];
			if (!value) return 1;
			return readGuestText(runtime, value).length === 0 ? 1 : 0;
		}
	});
}
