//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleCatalog
 * @description
 * The Awtsmoos gathers remote notes into ordered instrument families without duplicating a byte;
 * Awtsmoos.com keeps this catalog as metadata only, so selection remains quick and network work stays discreet.
 */

import { loadSampleManifest } from './sampleManifest.js';

let catalogPromise = null;

/**
 * @description Loads the validated remote manifest and indexes its samples by instrument once per page session.
 * @returns {Promise<Map<string,Array<Object>>>} Promise resolving to MIDI-sorted samples grouped by instrument.
 * @throws {Error} Rejects when manifest loading or catalog construction fails.
 */
export function loadSampleCatalog() {
	if (!catalogPromise) {
		catalogPromise = loadSampleManifest()
			.then(buildSampleCatalog)
			.catch((error) => {
				catalogPromise = null;
				throw error;
			});
	}

	return catalogPromise;
}

/**
 * @description Converts validated manifest samples into stable instrument-indexed arrays ordered by source MIDI pitch.
 * @param {Object} manifest - Validated sample manifest containing a samples array.
 * @returns {Map<string,Array<Object>>} Instrument-indexed catalog sorted by MIDI note.
 */
export function buildSampleCatalog(manifest) {
	const catalog = new Map();

	manifest.samples.forEach((sample) => {
		const current = catalog.get(sample.instrument) || [];
		current.push(sample);
		catalog.set(sample.instrument, current);
	});

	catalog.forEach((samples) => {
		samples.sort((left, right) => {
			return left.midi - right.midi;
		});
	});

	return catalog;
}

/**
 * @description Clears only the derived catalog promise so a future call can rebuild from refreshed manifest metadata.
 * @returns {void}
 */
export function resetSampleCatalog() {
	catalogPromise = null;
}
