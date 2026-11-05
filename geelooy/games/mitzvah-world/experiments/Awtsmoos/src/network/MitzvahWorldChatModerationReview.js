// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldChatModerationReview.js
	* @description Selects evidence, renders audit truth, and performs trusted report adjudication.
	* The Awtsmoos lets one visible word become bounded evidence; Awtsmoos.com keeps sender,
	* status, reviewer, note, lawful next action, safe text, and empty-state truth explicit.
	*/

export function selectChatModerationEvidence(panel, line) {
	const target = line?.dataset.playerAddress || '';
	if (!target) return false;
	panel.selectedMessageId = line.dataset.messageId || null;
	panel.root.querySelector('[data-chat-moderation-target]').value = target;
	panel.root.querySelector('[data-chat-selected-evidence]').textContent =
		panel.selectedMessageId
			? `Selected ${target} · ${panel.selectedMessageId}`
			: `Selected ${target}`;
	return true;
}

export function updateChatModeratorReviewVisibility(panel, snapshot) {
	panel.root.querySelector('[data-chat-review-wrap]').hidden = !snapshot?.moderator;
}

export async function refreshChatModeratorReports(panel) {
	const list = panel.root.querySelector('[data-chat-review-list]');
	list.textContent = 'Loading reports…';
	try {
		const response = await panel.client.mmorpg.community.reviewChatReports(50);
		renderReports(list, response.payload?.reports || []);
	} catch (error) {
		list.textContent = error.message;
	}
}

export async function adjudicateChatModeratorReport(panel, control) {
	const reportId = control.dataset.chatReportId;
	const status = control.dataset.chatReportStatus;
	const noteInput = panel.root.querySelector('[data-chat-review-note]');
	panel.setStatus(`${status} report…`);
	try {
		await panel.client.mmorpg.community.adjudicateChatReport(
			reportId,
			status,
			noteInput.value.trim() || null
		);
		noteInput.value = '';
		panel.setStatus(`Report ${status}.`);
		await refreshChatModeratorReports(panel);
	} catch (error) {
		panel.setStatus(error.message);
	}
}

function renderReports(list, reports) {
	if (!reports.length) {
		list.textContent = 'No reports.';
		return;
	}
	list.replaceChildren(...reports.map(report => reportCard(list, report)));
}

function reportCard(list, report) {
	const card = list.ownerDocument.createElement('article');
	card.className = 'Awtsmoos-chat-report-card';
	const summary = list.ownerDocument.createElement('p');
	summary.textContent = [
		report.id,
		report.status,
		report.reporterAddress,
		'→',
		report.targetAddress,
		report.messageId || 'no-message-id',
		report.reason
	].join(' · ');
	card.append(summary);
	if (report.reviewedAt) card.append(reviewLine(list, report));
	card.append(actionRow(list, report));
	return card;
}

function reviewLine(list, report) {
	const line = list.ownerDocument.createElement('small');
	line.textContent = [
		`Reviewed ${new Date(report.reviewedAt).toISOString()}`,
		report.reviewedByAddress,
		report.resolutionNote || 'no note'
	].join(' · ');
	return line;
}

function actionRow(list, report) {
	const row = list.ownerDocument.createElement('div');
	row.className = 'Awtsmoos-chat-report-actions';
	for (const status of nextStatuses(report.status)) {
		const button = list.ownerDocument.createElement('button');
		button.type = 'button';
		button.dataset.chatReportId = report.id;
		button.dataset.chatReportStatus = status;
		button.textContent = status === 'open' ? 'Reopen' : capitalize(status);
		row.append(button);
	}
	return row;
}

function nextStatuses(status) {
	return status === 'open' ? ['resolved', 'dismissed'] : ['open'];
}

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
