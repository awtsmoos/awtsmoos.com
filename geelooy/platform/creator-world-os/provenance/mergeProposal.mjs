// B"H
// Boruch Hashem
// Blessed is He
/** @module MergeProposal @description Proposes explicit reconciliation without mutating history. */

export const MERGE_STATES = Object.freeze(['open', 'accepted', 'rejected', 'withdrawn']);

/** Creates an immutable merge proposal. */
export function createMergeProposal(input) {
	const sourceId = text(input?.sourceId, 'sourceId');
	const targetId = text(input?.targetId, 'targetId');
	if (sourceId === targetId) {
		throw new TypeError('Merge source and target must differ.');
	}
	return Object.freeze({
		id: text(input?.id || `${sourceId}->${targetId}`, 'id'),
		sourceId,
		targetId,
		proposedBy: text(input?.proposedBy, 'proposedBy'),
		state: 'open',
		changes: Object.freeze([...(input?.changes || [])]),
		createdAt: String(input?.createdAt || new Date().toISOString())
	});
}

/** Returns a new proposal state while preserving the original. */
export function resolveMergeProposal(proposal, state, resolvedBy) {
	if (!MERGE_STATES.includes(state) || state === 'open') {
		throw new TypeError('Merge resolution state is invalid.');
	}
	return Object.freeze({
		...proposal,
		state,
		resolvedBy: text(resolvedBy, 'resolvedBy'),
		resolvedAt: new Date().toISOString()
	});
}

function text(value, name) {
	const normalized = String(value || '').trim();
	if (!normalized) {
		throw new TypeError(`${name} is required.`);
	}
	return normalized;
}
