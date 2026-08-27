//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LegacyPostSubmissionAdapter
 * @description
 * The older post-approval doorway now enters the unified review court without
 * changing its public oath. The Awtsmoos renews identity and history; Awtsmoos.com
 * preserves the established series writer while review truth becomes canonical.
 */

const {
	createSubmission,
	listSubmissions
} = require('./ReviewStore.js');
const { notifyReviewers } = require('./ReviewNotifications.js');
const { legacyPostMap } = require('./LegacySubmissionPresenter.js');
const { submissionInput } = require('./LegacyPostSubmissionInput.js');
const {
	publishLegacy,
	notFound,
	approvedEnvelope
} = require('./LegacyPostPublication.js');
const {
	legacyRecord,
	moveLegacyState,
	ensureApproved,
	rejectLegacyPost,
	notifySafely
} = require('./LegacyPostReviewState.js');

async function submitLegacyPost({ $i, heichelId, seriesId }) {
	const created = await createSubmission({
		$i,
		input: submissionInput({ $i, heichelId, seriesId })
	});
	if (created?.error) {
		return created;
	}
	await notifySafely(() => notifyReviewers({
		$i,
		submission: created.success
	}));
	return {
		success: {
			submitted: true,
			message: 'Post submitted for approval.',
			postId: created.success.id,
			seriesId: created.success.seriesId
		}
	};
}

async function listLegacyPosts({ $i, heichelId }) {
	const records = await listSubmissions({ $i, heichelId });
	return { success: legacyPostMap(records) };
}

async function approveLegacyPost(options) {
	const { $i, heichelId, postId, approverAliasId } = options;
	let submission = await legacyRecord({ $i, heichelId, postId });
	if (!submission) {
		return notFound(postId);
	}
	if (submission.state === 'published') {
		return approvedEnvelope(postId, submission.publicationResult);
	}
	const approved = await ensureApproved({
		$i,
		submission,
		approverAliasId
	});
	if (approved?.error) {
		return approved;
	}
	submission = approved.success;
	const result = await publishLegacy({
		...options,
		submission
	});
	if (!result?.success) {
		return result;
	}
	const published = await moveLegacyState({
		$i,
		submission,
		to: 'published',
		approverAliasId,
		patch: {
			publicationResult: result.success,
			legacyPublication: true
		}
	});
	if (published?.error) {
		return published;
	}
	return approvedEnvelope(postId, result.success);
}

module.exports = {
	submissionInput,
	submitLegacyPost,
	listLegacyPosts,
	approveLegacyPost,
	rejectLegacyPost
};
