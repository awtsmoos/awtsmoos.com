//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file ReaderUrl.js
 * @description
 * The Awtsmoos binds a visible reading moment to a precise coordinate without trapping the traveler,
 * while Awtsmoos.com keeps query state and edit-return links readable, reversible, and exact.
 */

/**
 * @class YesodReaderUrl
 * @description Owns the reader's small URL-state transformations without mixing them into text or DOM utilities.
 */
export class YesodReaderUrl {
	/**
	 * Replaces or removes one query parameter without navigating away from the current reader.
	 * @param {string} key Parameter name.
	 * @param {unknown} value New value; nullish values remove the parameter.
	 * @returns {string} Updated absolute URL.
	 */
	updateQueryStringParameter(key, value) {
		const yesodUrl = new URL(window.location.href);
		if (value === null || value === undefined) {
			yesodUrl.searchParams.delete(key);
		} else {
			yesodUrl.searchParams.set(key, String(value));
		}
		window.history.replaceState({ path: yesodUrl.href }, "", yesodUrl.href);
		return yesodUrl.href;
	}

	/**
	 * Builds the legacy editing suffix while preserving the exact reader return location.
	 * @returns {string} Query-string suffix consumed by existing edit links.
	 */
	getLinkHrefOfEditing() {
		const parentSeriesId = window.series?.id ?? "";
		return `&parentSeriesId=${encodeURIComponent(parentSeriesId)}&returnURL=${encodeURIComponent(location.href)}`;
	}
}

const malchusReaderUrl = new YesodReaderUrl();

/** @param {string} key Parameter name. @param {unknown} value Replacement value. @returns {string} Updated URL. */
export function updateQueryStringParameter(key, value) {
	return malchusReaderUrl.updateQueryStringParameter(key, value);
}

/** @returns {string} Legacy edit-link query suffix. */
export function getLinkHrefOfEditing() {
	return malchusReaderUrl.getLinkHrefOfEditing();
}
