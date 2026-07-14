// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchCommentRoutes
 * @description
 * Exact comment and post-comment windows remain separate from library ranking.
 */

const {
	findCommentById,
	findCommentsForPostAlias,
	findAliasesForPost
} = require('../rag/comments.js');
const { er } = require('../../general.js');
const { data } = require('./values.js');
const { safe } = require('./safe.js');

function commentRoutes($i) {
	return {
		'/search/rag/comments/:comment': async variables => safe(async () => {
			const values = data($i);
			if (!values.seriesId || !values.postId) {
				return er({
					code: 'MISSING_CONTEXT',
					message: 'Pass seriesId and postId.'
				});
			}
			return findCommentById({
				$i,
				commentId: variables.comment,
				heichelId: values.heichelId || 'ikar',
				seriesId: values.seriesId,
				postId: values.postId
			});
		}),
		'/search/rag/post-comments': async () => safe(async () => {
			const values = data($i);
			if (!values.seriesId || !values.postId) {
				return er({
					code: 'MISSING_CONTEXT',
					message: 'Pass seriesId and postId.'
				});
			}
			return postComments($i, values);
		})
	};
}

async function postComments($i, values) {
	const context = {
		$i,
		heichelId: values.heichelId || 'ikar',
		seriesId: values.seriesId,
		postId: values.postId,
		verseSection: values.verseSection,
		subSection: values.subSection
	};
	if (values.aliasId) {
		return {
			success: await findCommentsForPostAlias({
				...context,
				aliasId: values.aliasId
			})
		};
	}
	return {
		success: await findAliasesForPost(context)
	};
}

module.exports = {
	commentRoutes
};
