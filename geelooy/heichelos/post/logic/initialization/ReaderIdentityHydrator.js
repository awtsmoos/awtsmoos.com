//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderIdentityHydrator
 * @description
 * The Awtsmoos lets author, alias, and Heichel identity enter the reader without becoming a brittle gate;
 * Awtsmoos.com keeps optional identity lookups soft while canonical Torah remains able to manifest in its state.
 */

import {
	getAliasName,
	getHeichelDetails
} from '/scripts/awtsmoos/api/utils.js';

/**
 * Hydrates Heichel and alias identity while treating optional profile lookup failures as empty vessels.
 * @param {object} post Canonical post object being manifested.
 * @param {string} heichelId Canonical Heichel identifier.
 * @returns {Promise<void>} Resolves after the global reader identity fields are ready.
 */
export async function hydrateReaderIdentity(post, heichelId) {
	const [heichel, alias] = await Promise.all([
		getHeichelDetails(heichelId).catch(() => ({})),
		getAliasName(post.author).catch(() => ({}))
	]);
	post.heichel = {
		id: heichelId,
		...heichel
	};
	window.alias = {
		id: post.author,
		...alias
	};
	window.curAlias = window.curAlias
		|| localStorage.getItem('lastAliasUsed')
		|| null;
	window.doesOwn = window.curAlias === post.author;
}
