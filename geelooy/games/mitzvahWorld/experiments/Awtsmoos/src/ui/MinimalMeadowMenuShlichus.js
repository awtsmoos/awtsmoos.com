// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMenuShlichus.js
 * @description Prioritizes the dedicated Shlichus and renders changing objectives and reward truth.
 * The Awtsmoos joins parchment and menu beneath one present mission; Awtsmoos.com keeps
 * defeat, recovery, return, optional beauty, and completed honor in one living book.
 */

import {
	minimalMeadowCompletionHonorsMarkup,
	minimalMeadowOptionalObjectivesMarkup
} from './MinimalMeadowQuestOptionalPresentation.js';
import {
	minimalMeadowDedicatedQuestRecord
} from './MinimalMeadowMenuQuestRecord.js';

export function minimalMeadowShlichusMenuContent(runtime) {
	const dedicated = minimalMeadowDedicatedQuestRecord(runtime.quest?.snapshot?.());
	const adventure = chooseAdventure(runtime.adventures?.snapshot?.());
	const quest = chooseCurrentQuest(dedicated, adventure);
	if (!quest) return emptyContent(runtime.adventures?.snapshot?.());
	const objective = quest.objectives?.[quest.objectiveIndex || 0] || null;
	const progress = Number(objective?.progress || 0);
	const count = Math.max(1, Number(objective?.count || 1));
	const percent = Math.round(Math.min(1, progress / count) * 100);
	const definition = quest.definition || {};
	return {
		body: [
			`<article class="Awtsmoos-current-shlichus" data-quest-id="${escapeHtml(definition.id || '')}" data-status="${escapeHtml(quest.status)}">`,
			`<p class="Awtsmoos-shlichus-status"><strong>${escapeHtml(statusLabel(quest.status))}</strong>${quest.pinned ? ' · 📌 Pinned' : ''}</p>`,
			`<h3>📜 ${escapeHtml(definition.title || definition.name || 'Current Shlichus')}</h3>`,
			`<p>${escapeHtml(definition.description || 'Continue the current mission.')}</p>`,
			objective
				? objectiveMarkup(objective, progress, count, percent)
				: '<p>All objectives are complete.</p>',
			minimalMeadowOptionalObjectivesMarkup(quest.optionalObjectives, 'menu'),
			completionMarkup(quest),
			`<small>${sourceSummary(runtime, quest)}</small>`,
			'</article>'
		].join(''),
		title: 'Shlichus'
	};
}

export function subscribeMinimalMeadowShlichus(runtime, refresh) {
	const unsubscribers = [
		runtime.adventures?.onChange?.(() => refresh()),
		runtime.quest?.onChange?.(() => refresh())
	].filter(value => typeof value === 'function');
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function chooseCurrentQuest(dedicated, adventure) {
	if (dedicated && ['active', 'ready'].includes(dedicated.status)) return dedicated;
	return adventure || dedicated;
}

function chooseAdventure(snapshot = {}) {
	return snapshot.pinned?.[0]
		|| snapshot.active?.[0]
		|| snapshot.offered?.[0]
		|| snapshot.available?.[0]
		|| snapshot.completed?.[0]
		|| null;
}

function objectiveMarkup(objective, progress, count, percent) {
	return `<section><strong>${escapeHtml(objective.description || 'Current objective')}</strong><p>${progress}/${count} · ${percent}%</p><progress max="${count}" value="${progress}"></progress></section>`;
}

function completionMarkup(quest) {
	const receipt = quest.completionReceipt;
	if (!receipt) return '';
	return [
		`<div class="Awtsmoos-shlichus-receipt"><strong>Reward received</strong><p>${receipt.xp} XP · ${receipt.perutas} perutas · Level ${receipt.level}</p></div>`,
		minimalMeadowCompletionHonorsMarkup(receipt)
	].join('');
}

function sourceSummary(runtime, quest) {
	if (quest.source === 'dedicated-meadow-quest') {
		if (quest.status === 'ready') return 'Return to Reb Mendel for the promised reward.';
		if (quest.status === 'completed') return 'Completed — preserved in the Shlichus book.';
		return 'The parchment and menu share this exact changing objective.';
	}
	const snapshot = runtime.adventures?.snapshot?.() || {};
	return `${snapshot.active?.length || 0} active · ${snapshot.available?.length || 0} available · ${snapshot.completed?.length || 0} completed`;
}

function emptyContent(snapshot = {}) {
	return {
		body: `<article class="Awtsmoos-current-shlichus"><h3>📜 No current Shlichus</h3><p>Speak with a mission giver to begin.</p><small>${snapshot.active?.length || 0} active · ${snapshot.completed?.length || 0} completed</small></article>`,
		title: 'Shlichus'
	};
}

function statusLabel(status) {
	return ({
		active: 'In progress',
		available: 'Available',
		completed: 'Complete',
		offered: 'Offered',
		ready: 'Ready to return'
	})[status] || 'Available';
}

function escapeHtml(value) {
	return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
