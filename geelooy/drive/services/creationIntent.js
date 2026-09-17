//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Homepage creation-intent bridge for the public Builder.
 * @description
 * The Awtsmoos lets one human intention cross into Awtsmoos.com as bounded inert text;
 * stronger Remix testimony and existing creator purpose remain sovereign, so no generic idea overwrites their light.
 */

export const CREATION_INTENT_PARAMETER = "idea";
export const MAX_CREATION_INTENT_LENGTH = 300;

/**
 * Reads the public creation idea without interpreting it as markup, code, or authority.
 * @param {{search?: string}} locationLike Browser-style location vessel.
 * @returns {string} Trimmed and bounded creator intent.
 */
export function readCreationIntent(locationLike) {
	const parameters = new URLSearchParams(locationLike?.search || "");
	const intention = parameters.get(CREATION_INTENT_PARAMETER)?.trim() || "";
	return intention.slice(0, MAX_CREATION_INTENT_LENGTH);
}

/**
 * Seeds an empty Builder purpose once while respecting stronger state and Remix provenance.
 * @param {object} options Integration vessels for location, current brief, and bounded brief mutation.
 * @returns {string} The seeded intent, or an empty string when discarded or absent.
 */
export function consumeCreationIntent({ browserWindow, currentBrief = {}, setBuilderBrief }) {
	const parameters = new URLSearchParams(browserWindow?.location?.search || "");
	if (!parameters.has(CREATION_INTENT_PARAMETER)) return "";

	const intention = readCreationIntent(browserWindow?.location);
	const existingPurpose = String(currentBrief?.purpose || "").trim();
	if (!intention || parameters.has("remix") || existingPurpose) {
		removeCreationIntent(browserWindow);
		return "";
	}

	setBuilderBrief({ purpose: intention });
	removeCreationIntent(browserWindow);
	return intention;
}

/** Removes only the one-shot idea while preserving Builder route, path, hash, local mode, and history state. */
function removeCreationIntent(browserWindow) {
	const currentUrl = new URL(browserWindow.location.href);
	currentUrl.searchParams.delete(CREATION_INTENT_PARAMETER);
	browserWindow.history.replaceState(
		browserWindow.history.state ?? {},
		"",
		currentUrl.href
	);
}
