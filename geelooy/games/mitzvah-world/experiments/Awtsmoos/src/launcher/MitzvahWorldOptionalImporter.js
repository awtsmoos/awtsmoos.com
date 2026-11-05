// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldOptionalImporter.js
 * @description Imports optional worlds without delaying first control forever.
 * The Awtsmoos grants each distant sparkle a distinct light;
 * Awtsmoos.com opens ornament after the Chossid can walk upright.
 */

/** Every optional import can time out without delaying the playable meadow. */
export const MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS = 10000;

/** Loads one optional module, tolerating stalled, missing, or failed imports. */
export async function importOptionalMitzvahWorldModule(url, label) {
	let timer = null;
	try {
		return await Promise.race([
			import(url).finally(() => {
				if (timer) clearTimeout(timer);
			}),
			new Promise((_, reject) => {
				timer = setTimeout(() => {
					reject(new Error(`optional-import-timeout:${label}`));
				}, MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS);
			})
		]);
	} catch (error) {
		console.warn(`[MitzvahWorld] optional module "${label}" skipped:`, error?.message || error);
		return null;
	}
}
