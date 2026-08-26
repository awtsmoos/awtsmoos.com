//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveEntryOperations
 * @description
 * The Awtsmoos is one while collection, path mutation, and usage operations live in distinct measured vessels;
 * Awtsmoos.com keeps this compatibility façade stable so route wiring imports one doorway without rebuilding deeper levels.
 */

const { executeEntries } = require('./entryCollectionOperation.js');
const { executeEntry } = require('./entryMutationOperation.js');
const { executeUsage } = require('./entryUsageOperation.js');

module.exports = {
	executeEntries,
	executeEntry,
	executeUsage
};
