//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ReviewDetail
 * @description
 * The Awtsmoos renews evidence and consequence together. Awtsmoos.com keeps the
 * existing legal-action matrix authoritative while one computed action set now
 * drives visibility, contextual fields, and the consequence chamber consistently.
 */

import { ReviewConsequences } from './ReviewConsequences.js';
import { semanticSummary } from './ReviewSummary.js';
import { ReviewSummaryView } from './ReviewSummaryView.js';

function heading(submission) {
	return [
		submission.title || `${submission.type} submission`,
		`${submission.state} · ${submission.type}`,
		`Submitted by ${submission.submitterAliasId}`,
		`Destination ${submission.heichelId}/${submission.seriesId}`,
		submission.assignedAliasId
			? `Assigned to ${submission.assignedAliasId}`
			: 'Unassigned'
	].join('\n');
}

function historyText(history = []) {
	return history.map(function historyEvent(event) {
		const when = new Date(event.at).toLocaleString();
		const actor = event.actorAliasId || 'system';
		const transition = `${event.from || 'created'} → ${event.to}`;
		const note = event.note ? ` · ${event.note}` : '';
		return `${when} · ${actor} · ${transition}${note}`;
	}).join('\n');
}

function allowedActions(submission, access, aliasId) {
	const reviewer = access?.capabilities?.includes('reviewSubmissions');
	const author = submission.submitterAliasId === aliasId;
	const actions = [];
	if (reviewer && ['submitted', 'triaged'].includes(submission.state)) {
		actions.push('triage', 'assign', 'changes', 'approve', 'reject');
	}
	if (reviewer && submission.state === 'approved') {
		actions.push('schedule', 'publish', 'reject');
	}
	if (reviewer && submission.state === 'scheduled') {
		actions.push('publish', 'reject');
	}
	if (author && ['submitted', 'triaged', 'changes_requested'].includes(submission.state)) {
		const authorAction = submission.state === 'changes_requested'
			? 'resubmit'
			: 'withdraw';
		actions.push(authorAction);
	}
	return [...new Set(actions)];
}

export class ReviewDetail {
	constructor(root) {
		this.root = root;
		this.summaryView = new ReviewSummaryView(root);
		this.consequenceView = new ReviewConsequences(root);
	}

	render(submission, access, aliasId) {
		const empty = this.element('detailEmpty');
		const panel = this.element('detailPanel');
		empty.hidden = Boolean(submission);
		panel.hidden = !submission;
		if (!submission) {
			return;
		}
		this.element('submissionHeading').textContent = heading(submission);
		this.element('submissionNote').textContent = submission.note || 'No submitter note.';
		this.element('submissionPayload').textContent = JSON.stringify(
			submission.payload || {},
			null,
			2
		);
		this.element('submissionHistory').textContent = historyText(submission.history);
		this.element('submissionId').textContent = submission.id;
		this.summaryView.render(semanticSummary(submission));
		const allowed = allowedActions(submission, access, aliasId);
		this.renderActions(submission, allowed, aliasId);
		this.consequenceView.render(submission, allowed);
	}

	renderActions(submission, allowed, aliasId) {
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
