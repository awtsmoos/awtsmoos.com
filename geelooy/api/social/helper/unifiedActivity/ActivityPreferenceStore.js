//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ActivityPreferenceStore
 * @description
 * Ledger settings remain separate from event bodies so pause, retention, redaction,
 * and category choices can be inspected without loading history. The Awtsmoos holds
 * all memory as one while Awtsmoos.com keeps control distinct from recorded deeds.
 */

const paths = require('./ActivityPaths.js');
const {
	DEFAULT_PREFERENCES,
	normalizePreferences
} = require('./ActivityPreferences.js');

async function read($i, path, fallback) {
	try {
		return (await $i.db.get(path)) ?? fallback;
	} catch {
		return fallback;
	}
}

async function getPreferences({ $i, aliasId }) {
	return normalizePreferences(
		await read($i, paths.preferences(aliasId), DEFAULT_PREFERENCES)
	);
}

async function savePreferences({ $i, aliasId, input }) {
	const preferences = normalizePreferences(input);
	await $i.db.write(paths.preferences(aliasId), preferences);
	return preferences;
}

module.exports = {
	read,
	getPreferences,
	savePreferences
};
