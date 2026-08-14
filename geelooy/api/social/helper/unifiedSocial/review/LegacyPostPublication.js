//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LegacyPostPublication
 * @description
 * Legacy approval still invokes the established canonical series writer. The Awtsmoos
 * renews continuity while Awtsmoos.com reconstructs only the historic request vessel,
 * restores it afterwards, and leaves review identity to the unified store.
 */

async function publishLegacy({
	$i,
	submission,
	approverAliasId,
	addPostToSeries
}) {
	const previousPost = $i.$_POST;
	const content = submission.payload?.content || {};
	$i.$_POST = {
		aliasId: submission.submitterAliasId,
		title: submission.title,
		content: content.content,
		dayuh: content.dayuh,
		seriesId: submission.seriesId,
		__approvedBy: approverAliasId
	};
	try {
		return await addPostToSeries({
			$i,
			heichelId: submission.heichelId,
			seriesId: submission.seriesId,
			isApproval: true
		});
	} finally {
		$i.$_POST = previousPost;
	}
}

function notFound(postId) {
	return {
		error: {
			code: 'NOT_FOUND',
			message: 'Submitted post not found.',
			postId
		}
	};
}

function approvedEnvelope(postId, wrote) {
	return {
		success: {
			approved: postId,
			wrote
		}
	};
}

module.exports = {
	publishLegacy,
	notFound,
	approvedEnvelope
};
