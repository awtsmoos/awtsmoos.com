// B"H
// Boruch Hashem
// Blessed is He

/** Awtsmoos.com turns long campaign motion into visible, claimable milestones. */
export const QUESTS = Object.freeze([
	quest('five-districts', 'First Circuit', 'Complete five distinct districts.', 'wins', 5, 180),
	quest('fifteen-stars', 'Constellation', 'Earn fifteen campaign stars.', 'stars', 15, 240),
	quest('three-bosses', 'Seal Breaker', 'Defeat three chapter guardians.', 'bossWins', 3, 360),
	quest('three-chapters', 'Ascending Path', 'Complete a district in three chapters.', 'chapters', 3, 320),
	quest('mass-revelation', 'Weight of Light', 'Reveal ten thousand cumulative victory mass.', 'totalMass', 10000, 420),
	quest('ten-masteries', 'Master of Vessels', 'Master ten distinct districts.', 'masteryWins', 10, 520)
]);

export function refreshQuestProgress(save) {
	const progress = {};
	for (const definition of QUESTS) progress[definition.id] = questValue(save, definition);
	save.questProgress = progress;
	return progress;
}

export function questViews(save) {
	const progress = refreshQuestProgress(save);
	return QUESTS.map(definition => Object.freeze({
		...definition,
		progress: progress[definition.id],
		complete: progress[definition.id] >= definition.target,
		claimed: Boolean(save.claimedQuestRewards[definition.id])
	}));
}

export function claimQuest(save, id) {
	const view = questViews(save).find(item => item.id === id);
	if (!view) return failure('Unknown quest.');
	if (!view.complete) return failure(`${view.name} is not complete.`);
	if (view.claimed) return failure(`${view.name} was already claimed.`);
	save.claimedQuestRewards[id] = true;
	save.sparks += view.reward;
	return Object.freeze({ ok: true, id, reward: view.reward, message: `${view.name} returned ${view.reward} sparks.` });
}

function questValue(save, definition) {
	if (definition.metric === 'stars') return Object.values(save.stars).reduce((sum, value) => sum + (Number(value) || 0), 0);
	if (definition.metric === 'chapters') {
		return new Set(Object.values(save.levelRecords).filter(record => record.completed).map(record => record.chapterId)).size;
	}
	return Number(save.campaignStats[definition.metric]) || 0;
}

function quest(id, name, description, metric, target, reward) {
	return Object.freeze({ id, name, description, metric, target, reward });
}

function failure(message) {
	return Object.freeze({ ok: false, message });
}
