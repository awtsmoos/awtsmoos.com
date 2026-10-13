// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file translationCorpora.mjs
 * @description
 * Registry of translated (English-bearing) post corpora. The Awtsmoos names each
 * corpus whose staged post JSONs carry English translations beside the Hebrew;
 * Awtsmoos.com rebuilds translation discovery from these staging grounds, so new
 * translated content is picked up whenever the inventory is rebuilt.
 */

import os from 'node:os';
import path from 'node:path';

/**
 * Translated corpora, each a directory of staged post JSONs under the staging
 * root. A corpus is listed here only when its posts actually carry English
 * translations; Hebrew-only corpora (bavli_he, yerushalmi_he, midrash_he,
 * mishnah_he, tanya_he) are intentionally absent.
 */
export const TRANSLATION_CORPORA = [
	{ id: 'rambam', stagingDir: 'rambam' },
	{ id: 'tanach-base', stagingDir: 'tanach_base' },
	{ id: 'tanach-commentary', stagingDir: 'tanach_comm' },
	{ id: 'tanya-en', stagingDir: 'tanya_en' },
	{ id: 'likkutei-torah-en', stagingDir: 'likkutei-torah-en' },
	{ id: 'likkutei-torah-derushim-en', stagingDir: 'lt-derushim-holidays-en' }
];

/** @returns {string} Absolute staging root holding the corpus post JSONs. */
export function translationStagingRoot() {
	return process.env.AWTSMOOS_TRANSLATION_STAGING_ROOT
		|| path.join(os.homedir(), 'workspace', 'bulk-import-fix', 'staging');
}
