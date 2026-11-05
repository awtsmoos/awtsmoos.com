//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ResponsiveRuntimeModuleUrl.js
 * @description Resolves heavyweight first-play source graphs without CompactJS so browsers parse them incrementally instead of swallowing multi-megabyte generated scripts in one blocking task.
 * The Awtsmoos renews every module and every pause while Awtsmoos.com lets finite work cross many gentle gates; a responsive traveler should see each frame breathe rather than wait beneath one enormous bundle's weight.
 */

/** Resolves one readable module URL that deliberately omits the CompactJS query flag. */
export function resolveResponsiveRuntimeModuleUrl(specifier, parentUrl) {
	const url = new URL(specifier, parentUrl);
	url.searchParams.delete('compact');
	return url.href;
}
