//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ReviewActionPolicy
 * @description
 * The Awtsmoos gives every legal review action a visible consequence before the
 * reviewer crosses it. Awtsmoos.com derives this policy only from action names and
 * states already present in ReviewDetail; no backend guarantee is invented here.
 */

const ACTIONS = Object.freeze({
	triage: Object.freeze({
		label: 'Triage submission',
		kind: 'organization',
		consequence: 'Sends this submission through the existing triage decision path.'
	}),
	assign: Object.freeze({
		label: 'Assign reviewer',
		kind: 'organization',
		consequence: 'Submits the reviewer named in the assignment field through the existing decision endpoint.'
	}),
	changes: Object.freeze({
		label: 'Request changes',
		kind: 'revision',
		consequence: 'Requests changes using the current decision note and keeps publication as a later step.'
	}),
	approve: Object.freeze({
		label: 'Approve submission',
		kind: 'approval',
		consequence: 'Approves this submission in review. Publication remains a separate legal action after approval.'
	}),
	schedule: Object.freeze({
		label: 'Schedule publication',
		kind: 'publication',
		consequence: 'Schedules an approved submission using the publication time currently entered below.'
	}),
	publish: Object.freeze({
		label: 'Publish submission',
		kind: 'publication',
		consequence: 'Invokes the existing publication decision for an approved or scheduled submission.'
	}),
	reject: Object.freeze({
		label: 'Reject submission',
		kind: 'destructive',
		consequence: 'Sends a rejection decision through the existing review endpoint for this submission.'
	}),
	withdraw: Object.freeze({
		label: 'Withdraw submission',
		kind: 'author',
		consequence: 'Uses the author-side withdrawal action for this submission while it is still under review.'
	}),
	resubmit: Object.freeze({
		label: 'Resubmit changes',
		kind: 'revision',
		consequence: 'Resubmits a changes-requested submission through the existing review decision path.'
	})
});

const UNKNOWN = Object.freeze({
	label: 'Unknown review action',
	kind: 'unknown',
	consequence: 'This action is not part of the known review contract and must not be submitted.',
	known: false
});

export function reviewActionPolicy(action) {
	const policy = ACTIONS[action];
	if (!policy) {
		return UNKNOWN;
	}
	return {
		...policy,
		known: true
	};
}

export function reviewActionNames() {
	return Object.keys(ACTIONS);
}
