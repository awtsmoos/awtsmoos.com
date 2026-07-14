//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ReviewDetail
 * @description
 * Provenance, payload, assignment, moderation history, and legal next actions are
 * shown together before a reviewer decides. The Awtsmoos sees no isolated fragment;
 * Awtsmoos.com therefore places source, policy, history, and consequence side by side.
 */

function heading(submission) {
	return [
		submission.title || `${submission.type} submission`,
		`${submission.state} · ${submission.type}`,
		`Submitted by ${submission.submitterAliasId}`,
		`Destination ${submission.heichelId}/${submission.seriesId}`,
		submission.assignedAliasId ? `Assigned to ${submission.assignedAliasId}` : 'Unassigned'
	].join('\n');
}

function historyText(history = []) {
	return history.map(event => {
		const when = new Date(event.at).toLocaleString();
		return `${when} · ${event.actorAliasId || 'system'} · ${event.from || 'created'} → ${event.to}${event.note ? ` · ${event.note}` : ''}`;
	}).join('\n');
}

function allowedActions(submission, access, aliasId) {
	const reviewer = access?.capabilities?.includes('reviewSubmissions');
	const author = submission.submitterAliasId === aliasId;
	const actions = [];
	if (reviewer && ['submitted', 'triaged'].includes(submission.state)) {
		actions.push('triage', 'assign', 'changes', 'approve', 'reject');
	}
	if (reviewer && submission.state === 'approved') actions.push('schedule', 'publish', 'reject');
	if (reviewer && submission.state === 'scheduled') actions.push('publish', 'reject');
	if (author && ['submitted', 'triaged', 'changes_requested'].includes(submission.state)) {
		actions.push(submission.state === 'changes_requested' ? 'resubmit' : 'withdraw');
	}
	return [...new Set(actions)];
}

export class ReviewDetail {
	constructor(root) {
		this.root = root;
	}

	render(submission, access, aliasId) {
		const empty = this.element('detailEmpty');
		const panel = this.element('detailPanel');
		empty.hidden = Boolean(submission);
		panel.hidden = !submission;
		if (!submission) return;
		this.element('submissionHeading').textContent = heading(submission);
		this.element('submissionNote').textContent = submission.note || 'No submitter note.';
		this.element('submissionPayload').textContent = JSON.stringify(submission.payload || {}, null, 2);
		this.element('submissionHistory').textContent = historyText(submission.history);
		this.element('submissionId').textContent = submission.id;
		const allowed = allowedActions(submission, access, aliasId);
		for (const button of this.root.querySelectorAll('[data-review-action]')) {
			button.hidden = !allowed.includes(button.dataset.reviewAction);
		}
		this.element('assignedAliasId').value = submission.assignedAliasId || aliasId;
	}

	element(id) {
		return this.root.getElementById(id);
	}
}

export {
	heading,
	historyText,
	allowedActions
};
