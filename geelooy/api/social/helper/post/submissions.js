//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module postSubmissions
 * @description
 * This legacy doorway keeps its public function names while durable review identity,
 * history, and state now live in the unified court. The Awtsmoos renews continuity;
 * Awtsmoos.com preserves the canonical series writer and existing caller contracts.
 */

const { er } = require('../general.js');
const { verifyHeichelAuthority } = require('../heichel.js');
const { getHeichelSubmissionSettings } = require('../heichelRoles.js');
const {
	submitLegacyPost,
	listLegacyPosts,
	approveLegacyPost,
	rejectLegacyPost
} = require('../unifiedSocial/review/LegacyPostSubmissionAdapter.js');

async function shouldSubmitPostForApproval({ $i, heichelId, aliasId }) {
	const authority = await verifyHeichelAuthority({ $i, heichelId, aliasId });
	if (authority) return { shouldSubmit: false, authority: true };
	const settings = (await getHeichelSubmissionSettings({ $i, heichelId })).success || {};
	if (settings.allowPostSubmissions === false) {
		return {
			shouldSubmit: false,
			authority: false,
			error: er({
				message: 'Post submissions are closed for this heichel.',
				code: 'POST_SUBMISSIONS_CLOSED'
			})
		};
	}
	return { shouldSubmit: true, authority: false };
}

async function submitPostForApproval({ $i, heichelId, seriesId }) {
	const body = $i.$_POST || {};
	if (!body.aliasId || !String(body.title || '').trim()) {
		return er({ code: 'MISSING_PARAMS', details: 'Requires aliasId and title' });
	}
	return submitLegacyPost({ $i, heichelId, seriesId });
}

function getSubmittedPosts({ $i, heichelId }) {
	return listLegacyPosts({ $i, heichelId });
}

async function approveSubmittedPost({
	$i, heichelId, postId, approverAliasId, addPostToSeries
}) {
	const authority = await verifyHeichelAuthority({
		$i, heichelId, aliasId: approverAliasId
	});
	if (!authority) {
		return er({ message: 'No authority to approve posts.', code: 'NO_AUTH' });
	}
	if (typeof addPostToSeries !== 'function') {
		return er({ message: 'Canonical series writer is required.', code: 'NO_POST_WRITER' });
	}
	return approveLegacyPost({
		$i, heichelId, postId, approverAliasId, addPostToSeries
	});
}

async function denySubmittedPost({ $i, heichelId, postId, approverAliasId }) {
	const authority = await verifyHeichelAuthority({
		$i, heichelId, aliasId: approverAliasId
	});
	if (!authority) {
		return er({ message: 'No authority to deny posts.', code: 'NO_AUTH' });
	}
	return rejectLegacyPost({ $i, heichelId, postId, approverAliasId });
}

module.exports = {
	shouldSubmitPostForApproval,
	submitPostForApproval,
	getSubmittedPosts,
	approveSubmittedPost,
	denySubmittedPost
};
