// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldChatModerationControls.js
	* @description Binds evidence, protection, reports, snapshots, review, and adjudication.
	* The Awtsmoos lets each listener guard one finite vessel without silencing the world;
	* Awtsmoos.com keeps target, reason, private state, moderator judgment, and teardown explicit.
	*/

import {
	adjudicateChatModeratorReport,
	refreshChatModeratorReports,
	selectChatModerationEvidence,
	updateChatModeratorReviewVisibility
} from './MitzvahWorldChatModerationReview.js';

export function bindChatModerationControls(panel) {
	const click = event => {
		const line = event.target.closest('[data-player-address]');
		if (line) selectChatModerationEvidence(panel, line);
		const action = event.target.closest('[data-chat-moderation-action]')
			?.dataset.chatModerationAction;
		if (action) runModeration(panel, action);
		if (event.target.closest('[data-chat-report]')) runReport(panel);
		if (event.target.closest('[data-chat-review]')) {
			refreshChatModeratorReports(panel);
		}
		const adjudication = event.target.closest('[data-chat-report-status]');
		if (adjudication) adjudicateChatModeratorReport(panel, adjudication);
	};
	panel.root.addEventListener('click', click);
	return {
		destroy() {
			panel.root.removeEventListener('click', click);
		},
		refresh() {
			return refreshModeration(panel);
		}
	};
}

async function runModeration(panel, action) {
	const target = moderationTarget(panel);
	if (!target) return panel.setStatus('Choose a player address first.');
	panel.setStatus(`${action}…`);
	try {
		const response = await panel.client.mmorpg.community.moderateChat(action, target);
		renderModeration(panel, response.payload);
		panel.setStatus(`${action} complete.`);
		await panel.refreshHistory();
	} catch (error) {
		panel.setStatus(error.message);
	}
}

async function runReport(panel) {
	const target = moderationTarget(panel);
	const reason = panel.root.querySelector('[data-chat-report-reason]').value.trim();
	if (!target || !reason) {
		return panel.setStatus('Choose a player and enter a report reason.');
	}
	panel.setStatus('Reporting…');
	try {
		await panel.client.mmorpg.community.reportChat(
			target,
			reason,
			panel.selectedMessageId || null
		);
		panel.selectedMessageId = null;
		panel.root.querySelector('[data-chat-report-reason]').value = '';
		panel.root.querySelector('[data-chat-selected-evidence]').textContent =
			'No message selected.';
		panel.setStatus('Report recorded.');
	} catch (error) {
		panel.setStatus(error.message);
	}
}

async function refreshModeration(panel) {
	try {
		const response = await panel.client.mmorpg.community.chatModerationSnapshot();
		renderModeration(panel, response.payload);
	} catch {
		renderModeration(panel, null);
	}
}

function renderModeration(panel, snapshot) {
	const output = panel.root.querySelector('[data-chat-moderation-status]');
	updateChatModeratorReviewVisibility(panel, snapshot);
	if (!snapshot) {
		output.textContent = 'Personal moderation unavailable.';
		return;
	}
	const muted = snapshot.mutedPlayerAddresses?.length || 0;
	const blocked = snapshot.blockedPlayerAddresses?.length || 0;
	output.textContent = `${muted} muted · ${blocked} blocked`;
}

function moderationTarget(panel) {
	return panel.root.querySelector('[data-chat-moderation-target]').value.trim();
}
