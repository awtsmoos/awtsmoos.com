//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SubmissionSchema
 * @description
 * Every offered post, answer, reference, quote, and edit enters a named state
 * instead of vanishing into an informal inbox. The Awtsmoos holds all becoming;
 * Awtsmoos.com records each permitted transition as accountable institutional time.
 */

const SUBMISSION_TYPES = Object.freeze([
	'canonical',
	'placement',
	'question',
	'answer',
	'quote',
	'series',
	'edit',
	'translation',
	'mediaReplacement'
]);

const SUBMISSION_STATES = Object.freeze([
	'submitted',
	'triaged',
	'changes_requested',
	'approved',
	'scheduled',
	'published',
	'rejected',
	'withdrawn',
	'expired'
]);

const TRANSITIONS = Object.freeze({
	submitted: ['triaged', 'changes_requested', 'approved', 'rejected', 'withdrawn'],
	triaged: ['changes_requested', 'approved', 'rejected', 'withdrawn'],
	changes_requested: ['submitted', 'withdrawn', 'expired'],
	approved: ['scheduled', 'published', 'rejected'],
	scheduled: ['published', 'rejected', 'expired'],
	published: [],
	rejected: [],
	withdrawn: [],
	expired: []
});

function clean(value, maximum = 1600) {
	return String(value || '')
		.replace(/[<>\u0000-\u001f]/g, '')
		.trim()
		.slice(0, maximum);
}

function normalizeSubmission(value = {}) {
	return {
		type: SUBMISSION_TYPES.includes(value.type) ? value.type : 'canonical',
		heichelId: clean(value.heichelId, 120),
		seriesId: clean(value.seriesId || 'root', 120) || 'root',
		submitterAliasId: clean(value.submitterAliasId || value.aliasId, 120),
		assignedAliasId: clean(value.assignedAliasId, 120),
		state: SUBMISSION_STATES.includes(value.state) ? value.state : 'submitted',
		title: clean(value.title, 240),
		note: clean(value.note, 1600),
		payload: value.payload && typeof value.payload === 'object' ? value.payload : {},
		createdAt: Number(value.createdAt || Date.now()),
		updatedAt: Number(value.updatedAt || Date.now())
	};
}

function validateSubmission(submission) {
	const errors = [];
	if (!submission.heichelId) errors.push('heichelId is required.');
	if (!submission.seriesId) errors.push('seriesId is required.');
	if (!submission.submitterAliasId) errors.push('submitterAliasId is required.');
	if (!submission.title && submission.type !== 'placement') errors.push('title is required.');
	if (!submission.payload || typeof submission.payload !== 'object') errors.push('payload must be an object.');
	return { valid: errors.length === 0, errors };
}

function canTransition(from, to) {
	return Boolean(TRANSITIONS[from]?.includes(to));
}

function transitionError(from, to) {
	return {
		error: {
			code: 'ILLEGAL_SUBMISSION_TRANSITION',
			message: `A submission cannot move from ${from} to ${to}.`,
			allowed: TRANSITIONS[from] || []
		}
	};
}

module.exports = {
	SUBMISSION_TYPES,
	SUBMISSION_STATES,
	TRANSITIONS,
	clean,
	normalizeSubmission,
	validateSubmission,
	canTransition,
	transitionError
};
