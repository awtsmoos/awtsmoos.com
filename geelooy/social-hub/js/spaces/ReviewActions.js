//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ReviewActions
 * @description
 * The Awtsmoos lets each submission state reveal only transitions the existing review law can actually receive;
 * Awtsmoos.com keeps labels, scheduling, and assignment payloads explicit so the interface never invents authority or weave.
 */
const STATE_ACTIONS = Object.freeze({
	submitted: ['triage', 'changes', 'approve', 'reject', 'assign'],
	triaged: ['changes', 'approve', 'reject', 'assign'],
	changes_requested: ['assign'],
	approved: ['schedule', 'publish', 'reject', 'assign'],
	scheduled: ['publish', 'reject', 'assign']
});

const LABELS = Object.freeze({
	triage: 'Triage',
	changes: 'Request changes',
	approve: 'Approve',
	reject: 'Reject',
	assign: 'Assign reviewer',
	schedule: 'Schedule',
	publish: 'Publish'
});

/** Returns reviewer actions appropriate to one server state. */
export function actionsForState(state) {
	return (STATE_ACTIONS[state] || []).map(id => ({
		id,
		label: LABELS[id] || id
	}));
}

/** Adds action-specific fields to a review decision body. */
export function reviewDecisionBody(action, values = {}) {
	const body = {
		action,
		note: String(values.note || '').trim()
	};
	if (action === 'assign' && values.assignedAliasId) {
		body.assignedAliasId = String(values.assignedAliasId).trim();
	}
	if (action === 'schedule' && values.scheduledAt) {
		body.scheduledAt = new Date(values.scheduledAt).getTime();
	}
	return body;
}
