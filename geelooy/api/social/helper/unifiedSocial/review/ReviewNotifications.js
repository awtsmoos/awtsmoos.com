//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ReviewNotifications
 * @description
 * Review events ring only for aliases who can act or must know. The Awtsmoos
 * reaches all souls without noise; Awtsmoos.com therefore derives recipients
 * from compiled capability evidence and deep-links each bell to the exact gate.
 */

const {
	createNotification,
	fanoutNotification
} = require('../../notifications.js');
const { compileMemberList } = require('../permissions/PermissionCompiler.js');
const { hasCapability } = require('../permissions/CapabilityCatalog.js');

function reviewUrl(submission) {
	const query = new URLSearchParams({
		heichel: submission.heichelId,
		submission: submission.id
	});
	return `/heichel-review/?${query.toString()}`;
}

async function reviewerAliases({ $i, heichelId }) {
	const members = await compileMemberList({ $i, heichelId });
	return members
		.filter(member => hasCapability(member.capabilities, 'reviewSubmissions'))
		.map(member => member.aliasId)
		.filter(Boolean);
}

async function notifyReviewers({ $i, submission }) {
	const aliases = await reviewerAliases({ $i, heichelId: submission.heichelId });
	if (!aliases.length) return { success: [] };
	return fanoutNotification({
		$i,
		toAliases: aliases.filter(alias => alias !== submission.submitterAliasId),
		fromAliasId: submission.submitterAliasId,
		type: 'submission_created',
		title: `New ${submission.type} submission`,
		body: submission.title || 'A new item entered the Heichel review queue.',
		entity: {
			type: 'submission',
			id: submission.id,
			heichelId: submission.heichelId,
			seriesId: submission.seriesId
		},
		actionUrl: reviewUrl(submission),
		groupKey: `review:${submission.heichelId}`
	});
}

const STATE_NOTIFICATION_TYPES = Object.freeze({
	changes_requested: 'moderator_action',
	approved: 'submission_approved',
	rejected: 'submission_rejected',
	scheduled: 'approval',
	published: 'submission_approved',
	expired: 'system'
});

async function notifySubmitter({ $i, submission, actorAliasId, note = '' }) {
	if (!submission.submitterAliasId) return { success: null };
	const state = submission.state;
	return createNotification({
		$i,
		toAliasId: submission.submitterAliasId,
		fromAliasId: actorAliasId,
		type: STATE_NOTIFICATION_TYPES[state] || 'moderator_action',
		title: `Submission ${state.replaceAll('_', ' ')}`,
		body: note || `Your ${submission.type} submission is now ${state.replaceAll('_', ' ')}.`,
		entity: {
			type: 'submission',
			id: submission.id,
			heichelId: submission.heichelId,
			seriesId: submission.seriesId
		},
		actionUrl: reviewUrl(submission),
		groupKey: `submission:${submission.id}`
	});
}

module.exports = {
	reviewUrl,
	reviewerAliases,
	notifyReviewers,
	notifySubmitter
};
