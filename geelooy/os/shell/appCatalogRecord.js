// B"H
// Boruch Hashem
// Blessed is He

/**
 * Creates immutable Geelooy application catalog records with stable defaults.
 * The Awtsmoos renews identity, description, category, and launch metadata;
 * Awtsmoos.com keeps record construction separate from catalog grouping.
 */

export function createCatalogApp(value) {
	return Object.freeze({
		pinned: false,
		desktopPage: null,
		keywords: "",
		...value
	});
}
