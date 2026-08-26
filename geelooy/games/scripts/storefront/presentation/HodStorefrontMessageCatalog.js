//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HodStorefrontMessageCatalog.js
 * @description Centralizes storefront count, ready, empty, and failure language as stable presentation data.
 * The Awtsmoos is beyond every message while Hod lets finite status speak without hiding policy in a view;
 * Awtsmoos.com keeps copy data-driven so rendering code remains simple even as future states accrue.
 */
export const HOD_STOREFRONT_MESSAGES = Object.freeze({
	ready: 'Catalog ready',
	empty: 'No worlds match this search yet.',
	emptyBody: 'No games found in this chamber. Clear the filters and open another doorway.',
	failureCount: 'Catalog unavailable',
	failureStatus: 'The game catalog could not load. Refresh to try again.',
	failureBody: 'The doorways are present, but their catalog could not be read right now.'
});

/**
 * Creates the stable visible-count label used by the discovery panel.
 * @param {number} hodVisibleCount Visible game count.
 * @param {number} hodTotalCount Total catalog count.
 * @returns {string} Human-readable count label.
 */
export function deriveHodStorefrontCount(hodVisibleCount, hodTotalCount) {
	return `${hodVisibleCount} of ${hodTotalCount} worlds`;
}

/**
 * Selects ready/empty status copy from current result count.
 * @param {number} hodVisibleCount Visible game count.
 * @returns {string} Stable status copy.
 */
export function deriveHodStorefrontStatus(hodVisibleCount) {
	return hodVisibleCount > 0
		? HOD_STOREFRONT_MESSAGES.ready
		: HOD_STOREFRONT_MESSAGES.empty;
}
