//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LegacyPostReviewState
 * @description
 * State and notification consequences for legacy post offerings live in one focused
 * vessel. The Awtsmoos renews institutional time while Awtsmoos.com keeps every
 * approval or rejection as durable history instead of deleting the offered record.
 */

const {
	readSubmission,
	transitionSubmission
} = require('./ReviewStore.js');
const { notifySubmitter } = require('./ReviewNotifications.js');
const { isLegacyPost } = require('./LegacySubmissionPresenter.js');
const { notFound } = require('./LegacyPostPublication.js');

async function legacyRecord({ $i, heichelId, postId }) {
	const record = await readSubmission({
		$i,
		heichelId,
		id: postId
	});
	return isLegacyPost(record) ? record : null;
}

async function moveLegacyState({
	$i,
	submission,
	to,
	approverAliasId,
	patch = {}
}) {
	const moved = await transitionSubmission({
		$i,
		heichelId: submission.heichelId,
		id: submission.id,
		to,
		actorAliasId: approverAliasId,
		patch
	});
	if (moved?.success) {
		await notifySafely(() => notifySubmitter({
			$i,
			submission: moved.success,
			actorAliasId: approverAliasId
		}));
	}
	return moved;
}

async function ensureApproved({ $i, submission, approverAliasId }) {
	if (submission.state === 'approved' || submission.state === 'published') {
		return { success: submission };
	}
	return moveLegacyState({
		$i,
		submission,
		to: 'approved',
		approverAliasId
	});
}

async function rejectLegacyPost({ $i, heichelId, postId, approverAliasId }) {
	const submission = await legacyRecord({ $i, heichelId, postId });
	if (!submission) {
		return notFound(postId);
	}
	if (submission.state !== 'rejected') {
		const moved = await moveLegacyState({
			$i,
			submission,
			to: 'rejected',
			approverAliasId
		});
		if (moved?.error) return moved;
	}
	return {
		success: {
			denied: postId,
			deleted: false
		}
	};
}

async function notifySafely(notify) {
	try {
		await notify();
	} catch {
		return null;
	}
	return true;
}

module.exports = {
	legacyRecord,
	moveLegacyState,
	ensureApproved,
	rejectLegacyPost,
	notifySafely
};
