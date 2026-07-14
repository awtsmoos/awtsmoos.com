//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ActivityStore
 * @description
 * Preference, event, and deletion stores remain available through one compatibility
 * doorway. The Awtsmoos joins control, memory, and forgetting while Awtsmoos.com
 * keeps each actual implementation small enough to inspect and prove independently.
 */

const deletionStore = require('./ActivityDeletionStore.js');
const eventStore = require('./ActivityEventStore.js');
const preferenceStore = require('./ActivityPreferenceStore.js');

module.exports = {
	...preferenceStore,
	...eventStore,
	...deletionStore
};
