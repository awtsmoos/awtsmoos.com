//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ReviewService
 * @description
 * Legal transitions, publication, assignment, and notification meet at one gate.
 * The Awtsmoos joins promise and fulfillment; Awtsmoos.com records actor, reason,
 * state, responsibility, and resulting deed without manufacturing hidden authority.
 */
const { transitionSubmission } = require('./ReviewStore.js');
const { notifySubmitter } = require('./ReviewNotifications.js');
const { publishSubmission } = require('./SubmissionPublisher.js');
const { assignSubmission } = require('./ReviewAssignment.js');
const {
	queue,
	getOne,
	mayReview
} = require('./ReviewAccess.js');
const ACTION_STATES = Object.freeze({
	triage: 'triaged',
	changes: 'changes_requested',
	approve: 'approved',
	schedule: 'scheduled',
	reject: 'rejected',
	withdraw: 'withdrawn',
	resubmit: 'submitted'
});
async function move({ $i, submission, to, aliasId, note, patch = {} }) {
	const transitioned = await transitionSubmission({
		$i,
		heichelId: submission.heichelId,
		id: submission.id,
		to,
		actorAliasId: aliasId,
		note,
		patch
	});
	if (transitioned?.success) {
		transitioned.notification = await notifySubmitter({
			$i,
			submission: transitioned.success,
			actorAliasId: aliasId,
			note
		});
	}
	return transitioned;
}
async function publishApproved({ $i, submission, aliasId, note }) {
	let approved = submission;
	if (submission.state !== 'approved') {
		const moved = await move({ $i, submission, to: 'approved', aliasId, note });
		if (moved?.error) return moved;
		approved = moved.success;
	}
	const published = await publishSubmission({ $i, submission: approved });
	if (published?.error) return { error: published.error, approved };
	return move({
		$i,
		submission: approved,
		to: 'published',
		aliasId,
		note,
		patch: { publicationResult: published.success || published }
	});
}
function authorActionAllowed(submission, aliasId, action) {
	const authorAction = action === 'withdraw'
		|| (action === 'resubmit' && submission.state === 'changes_requested');
	return {
		authorAction,
		allowed: !authorAction || submission.submitterAliasId === aliasId
	};
}
async function decide({ $i, heichelId, id, aliasId, action, note = '' }) {
	const viewed = await getOne({ $i, heichelId, id, aliasId });
	if (viewed?.error) return viewed;
	const { submission, access } = viewed.success;
	const author = authorActionAllowed(submission, aliasId, action);
	if (!author.allowed) {
		return { error: { code: 'NO_AUTH', message: 'Only the submitter may perform this action.' } };
	}
	if (!author.authorAction && !mayReview(access)) {
		return { error: { code: 'NO_AUTH', message: 'This action requires reviewSubmissions.' } };
	}
	if (action === 'publish') return publishApproved({ $i, submission, aliasId, note });
	if (action === 'assign') {
		return assignSubmission({
			$i,
			heichelId,
			id,
			actorAliasId: aliasId,
			assignedAliasId: $i.$_POST?.assignedAliasId || aliasId,
			note
		});
	}
	const to = ACTION_STATES[action];
	if (!to) return { error: { code: 'UNKNOWN_REVIEW_ACTION', message: 'Unknown review action.' } };
	return move({
		$i,
		submission,
		to,
		aliasId,
		note,
		patch: action === 'schedule'
			? { scheduledAt: Number($i.$_POST?.scheduledAt || 0) }
			: {}
	});
}
module.exports = {
	ACTION_STATES,
	queue,
	getOne,
	move,
	publishApproved,
	authorActionAllowed,
	decide
};
