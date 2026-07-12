/**
 * B"H
 * @module ObjectiveRuntime
 * @description Pure matching and progress for ordered handcrafted objectives.
 */
const normalize = value => String(value || '').toUpperCase();
const targetMatches = (expected, actual) => {
	if (expected === '*' || expected == null) return true;
	if (Array.isArray(expected)) return expected.includes(actual);
	return expected === actual;
};

export const objectiveMatches = (objective, event) => {
	if (!objective || !event) return false;
	if (normalize(objective.type) !== normalize(event.type)) return false;
	if (!targetMatches(objective.target, event.target)) return false;
	if (objective.mapId && objective.mapId !== event.mapId) return false;
	return true;
};

export const applyObjectiveEvent = (instance, objective, event) => {
	if (!objectiveMatches(objective, event)) return { matched: false, completed: false };
	const amount = Math.max(1, Number(event.amount || 1));
	instance.progress = Math.min(objective.count || 1, (instance.progress || 0) + amount);
	const completed = instance.progress >= (objective.count || 1);
	return { matched: true, completed, progress: instance.progress, required: objective.count || 1 };
};

export const objectiveLine = (objective, progress = 0) => {
	if (!objective) return 'Mission complete.';
	const count = objective.count || 1;
	return count > 1 ? `${objective.description} (${progress}/${count})` : objective.description;
};
