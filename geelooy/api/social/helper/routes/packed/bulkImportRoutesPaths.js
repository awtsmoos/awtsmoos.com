//B"H
//Blessed is He
//Boruch Hashem

/**
 * Per-post packed layout paths for the bulk import API (split from bulkImportRoutes.js).
 */

// ---------------------------------------------------------------------------
// Per-post packed layout
// ---------------------------------------------------------------------------
const CHASSIDUS_BASE = '/ikar/social/chassidus_translations';
const CHASSIDUS_INDEX = CHASSIDUS_BASE + '/_index/commentIdToPost.json';

function perPostPath(aliasId, postId) {
	return CHASSIDUS_BASE + '/' + aliasId + '/' + postId + '.json';
}

module.exports = {
	CHASSIDUS_BASE,
	CHASSIDUS_INDEX,
	perPostPath,
};
