// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchCommentRoutes
 * @chapter Comment Windows Must Never Borrow Another Request's Post Or Series
 * @description
 * Reads comment lookup context from the immutable pre-await snapshot while retaining
 * the live request interface only for database and identity services.
 */

const {
	findCommentById,
	findCommentsForPostAlias,
	findAliasesForPost
} = require('../rag/comments.js');
const { er } = require('../../general.js');
const { data } = require('./values.js');
const { requestInterface } = require('./requestSnapshot.js');
const { safe } = require('./safe.js');

function commentRoutes(context) {
	const $i = requestInterface(context);
	return {
		'/search/rag/comments/:comment': async variables => safe(async () => {
			const values = data(context);
			if (!hasPostContext(values)) return missingContext();
			return findCommentById({
				$i,
				commentId: variables.comment,
				heichelId: values.heichelId || 'ikar',
				seriesId: values.seriesId,
				postId: values.postId
			});
		}),
		'/search/rag/post-comments': async () => safe(async () => {
			const values = data(context);
			if (!hasPostContext(values)) return missingContext();
			return postComments($i, values);
		})
	};
}

function hasPostContext(values) {
	return Boolean(values.seriesId && values.postId);
}

function missingContext() {
	return er({
		code: 'MISSING_CONTEXT',
		message: 'Pass seriesId and postId.'
	});
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
