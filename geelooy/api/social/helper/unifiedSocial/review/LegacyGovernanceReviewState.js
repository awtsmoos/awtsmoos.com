//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LegacyGovernanceReviewState
 * @description
 * Governance verdicts become canonical transitions while their historic metadata
 * remains visible to old callers. The Awtsmoos renews verdict and witness;
 * Awtsmoos.com retains every state change as durable institutional history.
 */

const {
	readSubmission,
	transitionSubmission
} = require('./ReviewStore.js');
const { notifySubmitter } = require('./ReviewNotifications.js');
const { isLegacyGovernance } = require('./LegacyGovernanceSubmissionPresenter.js');

async function governanceRecord({ $i, heichelId, submissionId }) {
	const record = await readSubmission({
		$i,
		heichelId,
		id: submissionId
	});
	return isLegacyGovernance(record) ? record : null;
}

async function moveGovernanceState(options) {
	const {
		$i, submission, to, actorAlias, note = '', patch = {}, notify = true
	} = options;
	const moved = await transitionSubmission({
		$i,
		heichelId: submission.heichelId,
		id: submission.id,
		to,
		actorAliasId: actorAlias,
		note,
		patch
	});
	if (notify && moved?.success) {
		await notifySafely(() => notifySubmitter({
			$i,
			submission: moved.success,
			actorAliasId: actorAlias
		}));
	}
	return moved;
}

function reviewPatch({ actorAlias, note }) {
	return {
		reviewedBy: actorAlias,
		reviewedAt: Date.now(),
		reviewNote: note || ''
	};
}

async function autoApprove({ $i, submission, actorAlias }) {
	return moveGovernanceState({
		$i,
		submission,
		to: 'approved',
		actorAlias,
		notify: false,
		patch: { legacyAutoApproved: true }
	});
}

async function reviewGovernance({ $i, submission, actorAlias, status, note }) {
	return moveGovernanceState({
		$i,
		submission,
		to: status,
		actorAlias,
		note,
		patch: reviewPatch({ actorAlias, note })
	});
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
	governanceRecord,
	moveGovernanceState,
	autoApprove,
	reviewGovernance,
	notifySafely
};
