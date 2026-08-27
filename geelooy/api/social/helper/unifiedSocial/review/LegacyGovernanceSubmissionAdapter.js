//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LegacyGovernanceSubmissionAdapter
 * @description
 * The governance submission doorway now speaks to one review store. The Awtsmoos
 * renews contributor, owner, verdict, and publication while Awtsmoos.com keeps the
 * old route envelopes as projections instead of independent institutional memory.
 */

const {
	createSubmission,
	listSubmissions
} = require('./ReviewStore.js');
const { notifyReviewers } = require('./ReviewNotifications.js');
const { submissionInput } = require('./LegacyGovernanceSubmissionInput.js');
const {
	legacyGovernanceSubmission,
	legacyGovernanceList
} = require('./LegacyGovernanceSubmissionPresenter.js');
const {
	governanceRecord,
	autoApprove,
	reviewGovernance,
	notifySafely
} = require('./LegacyGovernanceReviewState.js');
const { publishGovernance } = require('./LegacyGovernancePublication.js');

async function submitGovernance({ $i, heichelId, actorAlias, role }) {
	const created = await createSubmission({
		$i,
		input: submissionInput({ $i, heichelId, actorAlias })
	});
	if (created?.error) return created;
	let submission = created.success;
	if (role === 'owner' || role === 'admin') {
		const approved = await autoApprove({ $i, submission, actorAlias });
		if (approved?.error) return approved;
		submission = approved.success;
	} else {
		await notifySafely(() => notifyReviewers({
			$i,
			submission
		}));
	}
	return { success: legacyGovernanceSubmission(submission) };
}

async function listGovernance({ $i, heichelId }) {
	const records = await listSubmissions({ $i, heichelId });
	return { success: legacyGovernanceList(records) };
}

async function reviewGovernanceSubmission(options) {
	const { $i, heichelId, submissionId, actorAlias, status } = options;
	const submission = await governanceRecord({ $i, heichelId, submissionId });
	if (!submission) return notFound();
	const moved = await reviewGovernance({
		$i,
		submission,
		actorAlias,
		status,
		note: $i.$_POST?.note || ''
	});
	if (moved?.error) return moved;
	return { success: legacyGovernanceSubmission(moved.success) };
}

async function publishGovernanceSubmission({
	$i, heichelId, submissionId, actorAlias
}) {
	const submission = await governanceRecord({ $i, heichelId, submissionId });
	if (!submission) return notFound();
	return publishGovernance({ $i, submission, actorAlias });
}

function notFound() {
	return {
		error: {
			code: 'SUBMISSION_NOT_FOUND',
			message: 'Submission not found.'
		}
	};
}

module.exports = {
	submitGovernance,
	listGovernance,
	reviewGovernanceSubmission,
	publishGovernanceSubmission
};
