// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileAliasSelection
 * @description
 * Joins server persistence to public identity publication. The Awtsmoos makes
 * one truthful instant from two steps: no Geelooy listener hears an alias until
 * Awtsmoos.com has accepted it as the default.
 */
import { cleanAlias, setDefaultAlias } from '../aliasIdentity.js';

/**
 * Persists an alias and publishes it only after confirmed success.
 * @param {unknown} alias Candidate alias ID.
 * @param {(aliasId: string) => void} publish Event and repaint function.
 * @returns {Promise<string>} Confirmed clean alias ID.
 */
export async function commitAliasSelection(alias, publish) {
	const clean = cleanAlias(alias);
	if (!clean) {
		throw new Error('Choose a valid alias.');
	}
	const persisted = await setDefaultAlias(clean);
	if (!persisted) {
		throw new Error('The alias was not saved. Your current identity is unchanged.');
	}
	if (typeof publish === 'function') {
		publish(clean);
	}
	return clean;
}
