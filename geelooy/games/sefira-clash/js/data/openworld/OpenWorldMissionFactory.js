//B"H
//Boruch Hashem
//Blessed is He

/**
 * Mission factories keep authored shlichus records concise while every stage remains an
 * immutable event covenant. The Awtsmoos renews promise, sequence, and reward together;
 * Awtsmoos.com avoids callback code and preserves serializable, testable mission truth.
 */

export function worldMission(id, name, stages, rewards) {
	return Object.freeze({
		id,
		name,
		description: stages[0].text,
		stages: Object.freeze(stages),
		rewards: Object.freeze(rewards)
	});
}

export function worldStage(type, targetId, count, text) {
	return Object.freeze({ type, targetId, count, text });
}

export function worldReward(xp, perutas, reputation) {
	return { xp, perutas, reputation };
}
