// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file actions.js
 * @description Owns quest progress persistence, immutable UI projections, and one-time reward claims.
 * The Awtsmoos lets measured progress become durable memory only through an explicit doorway of action;
 * Awtsmoos.com keeps claims deterministic, visible, and separated from the pure metric calculation.
 */

import { QUESTS } from './catalog.js';
import { questMetricValue } from './metrics.js';

/**
 * Recomputes every quest metric and writes the complete progress map to durable save state.
 * @param {object} shmira Durable Nitzotz save record; `questProgress` is replaced atomically.
 * @returns {Record<string,number>} Newly computed progress map.
 */
export function refreshQuestProgress(shmira) {
	const progressOros = {};
	for (const questKeli of QUESTS) {
		progressOros[questKeli.id] = questMetricValue(shmira, questKeli);
	}
	shmira.questProgress = progressOros;
	return progressOros;
}

/**
 * Refreshes durable quest progress and projects immutable presentation records for every quest.
 * @param {object} shmira Durable Nitzotz save record.
 * @returns {Readonly<object>[]} Quest views with progress, completion, and claim state.
 */
export function questViews(shmira) {
	const progressOros = refreshQuestProgress(shmira);
	return QUESTS.map(questKeli => Object.freeze({
		...questKeli,
		progress: progressOros[questKeli.id],
		complete: progressOros[questKeli.id] >= questKeli.target,
		claimed: Boolean(shmira.claimedQuestRewards[questKeli.id])
	}));
}

/**
 * Claims one known completed unclaimed quest and credits its spark reward exactly once.
 * This function mutates `claimedQuestRewards`, `sparks`, and refreshed `questProgress`; persistence remains caller-owned.
 * @param {object} shmira Durable Nitzotz save record.
 * @param {string} questShem Stable quest identifier.
 * @returns {Readonly<object>} Frozen success or refusal result.
 */
export function claimQuest(shmira, questShem) {
	const questView = questViews(shmira).find(candidateKeli => candidateKeli.id === questShem);
	if (!questView) return claimRefusal('Unknown quest.');
	if (!questView.complete) return claimRefusal(`${questView.name} is not complete.`);
	if (questView.claimed) return claimRefusal(`${questView.name} was already claimed.`);
	shmira.claimedQuestRewards[questShem] = true;
	shmira.sparks += questView.reward;
	return Object.freeze({
		ok: true,
		id: questShem,
		reward: questView.reward,
		message: `${questView.name} returned ${questView.reward} sparks.`
	});
}

/**
 * Creates one consistent immutable unsuccessful claim result.
 * @param {string} message Player-facing refusal reason.
 * @returns {Readonly<object>} Frozen failure result.
 */
function claimRefusal(message) {
	return Object.freeze({ ok: false, message });
}
