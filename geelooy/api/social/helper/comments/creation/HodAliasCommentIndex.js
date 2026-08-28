//B"H
//Boruch Hashem
//Blessed is He

const { sp } = require('../../_awtsmoos.constants.js');
const { er } = require('../../general.js');
const { commentsOfAliasByHeichelAndSeriesAndParent } = require('../commentPaths.js');

/**
 * @module HodAliasCommentIndex
 * @description
 * Hod communicates where an alias has spoken without becoming another comment authority.
 * The Awtsmoos creates the path and the memory anew; Awtsmoos.com keeps this breadcrumb index light and true,
 * so discovery may find a parent while canonical words remain only in their proper storage view.
 */

/**
 * @description Updates the lightweight alias-to-parent comment index and optional breadcrumb index.
 * @param {object} params Indexing context.
 * @param {object} params.$i Request vessel exposing database and optional API fetch capability.
 * @param {string} params.aliasId Comment author alias.
 * @param {string} params.heichelId Destination heichel.
 * @param {string} params.seriesId Destination series.
 * @param {string} params.parentType Direct parent type.
 * @param {string} params.parentId Direct parent identifier.
 * @param {string} params.postId Ultimate post identifier for reply paths.
 * @returns {Promise<object>} Legacy-compatible success or error garment.
 * @throws {never} Unexpected failures are translated through the existing `er` compatibility helper.
 */
async function addCommentIndexToAlias(params) {
	try {
		if (!params.aliasId || !params.heichelId || !params.seriesId) {
			return er('Missing parameters for alias index update.', params);
		}
		const parentIndexPath = commentsOfAliasByHeichelAndSeriesAndParent(params);
		if (!parentIndexPath) {
			return er('Could not determine parent @ series index path.');
		}
		const syncResult = await params.$i.db.syncKeyInObj(parentIndexPath, params.parentId);
		if (syncResult?.error) {
			return er('Database error updating series index.', {
				code: 'DB_INDEX_ERROR',
				details: syncResult.error,
				path: parentIndexPath
			});
		}
		const breadcrumbIndex = await maybeWriteBreadcrumb(params);
		return { success: true, details: syncResult, breadcrumbIndex };
	} catch (error) {
		return er({ message: 'Internal error updating alias index.', details: error.stack });
	}
}

/**
 * @description Writes the optional legacy series-chain breadcrumb only when explicitly enabled.
 * @param {object} params Same validated index context accepted by {@link addCommentIndexToAlias}.
 * @returns {Promise<string>} `enabled` when written, otherwise `skippedForFastWrites`.
 * @throws {Error} Propagates fetch/database failures to the caller's compatibility error boundary.
 */
async function maybeWriteBreadcrumb(params) {
	if (process.env.AWTSMOOS_ENABLE_COMMENT_BREADCRUMB_INDEX !== '1') {
		return 'skippedForFastWrites';
	}
	const breadcrumb = await params.$i.fetchAwtsmoos(
		`/api/social/heichelos/${params.heichelId}/series/${params.seriesId}/breadcrumb`
	);
	if (Array.isArray(breadcrumb)) {
		const chain = breadcrumb.map((entry) => entry.id).join('/');
		const path = `${sp}/aliases/${params.aliasId}/comments/heichel/${params.heichelId}/seriesChain/${chain}`;
		await params.$i.db.write(path, { seriesId: params.seriesId, breadcrumb: chain, updatedAt: Date.now() });
	}
	return 'enabled';
}

module.exports = {
	addCommentIndexToAlias,
	maybeWriteBreadcrumb
};
