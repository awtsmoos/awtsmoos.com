// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AdventureStoreRules.js
 * @description Holds pure quest record creation, event matching, progress, and snapshots.
 * The Awtsmoos renews each objective beneath one lawful transition; Awtsmoos.com
 * keeps store coordination small while every shlichus rule remains directly testable.
 */

export function createAdventureRecord(definition) {
	return {
		definition,
		objectiveIndex: 0,
		objectives: definition.objectives.map(item => ({
			...item,
			progress: 0
		})),
		pinned: false,
		status: 'available'
	};
}

export function resetAdventureRecord(record) {
	return {
		...createAdventureRecord(record.definition),
		status: 'available'
	};
}

export function applyAdventureEvent(record, event) {
	if (record.status !== 'active') return false;
	const objective = currentAdventureObjective(record);
	if (!objectiveMatchesEvent(objective, event)) return false;
	objective.progress = Math.min(
		objective.count,
		objective.progress + Number(event.count || 1)
	);
	if (objective.progress >= objective.count) advanceAdventure(record);
	return true;
}

export function adventureSnapshot(records) {
	const values = [...records.values()];
	return structuredClone({
		active: values.filter(item => item.status === 'active'),
		available: values.filter(item => (
			['available', 'declined', 'offered'].includes(item.status)
		)),
		completed: values.filter(item => item.status === 'completed'),
		offered: values.filter(item => item.status === 'offered'),
		pinned: values.filter(item => item.pinned)
	});
}

export function currentAdventureObjective(record) {
	return record.objectives[record.objectiveIndex] || null;
}

function objectiveMatchesEvent(objective, event) {
	if (!objective || objective.eventType !== event.type) return false;
	if (objective.target === event.target) return true;
	if (objective.target === 'kosher-animal') return Boolean(event.kosherEligible);
	if (objective.target === 'orchard-predator') {
		return ['fox', 'wolf'].includes(event.target);
	}
	if (objective.target === 'forest-predator') {
		return ['fox', 'wolf', 'snake', 'spider'].includes(event.target);
	}
	return false;
}

function advanceAdventure(record) {
	record.objectiveIndex += 1;
	if (record.objectiveIndex < record.objectives.length) return;
	record.status = 'completed';
	record.pinned = false;
	record.completedAt = Date.now();
}
