// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMenuQuestRecord.js
 * @description Normalizes the dedicated meadow Shlichus for the shared mission book.
 * The Awtsmoos lets one present purpose shine through many surfaces; Awtsmoos.com keeps
 * defeat, recovery, return, and completion aligned without swelling the menu vessel.
 */

export function minimalMeadowDedicatedQuestRecord(snapshot) {
	if (!snapshot?.definition) {
		return null;
	}
	const currentObjective = snapshot.currentObjective
		|| fallbackObjective(snapshot);
	return {
		completionReceipt: snapshot.completionReceipt,
		definition: snapshot.definition,
		objectiveIndex: 0,
		objectives: [currentObjective],
		optionalObjectives: snapshot.optionalObjectives || [],
		pinned: ['active', 'ready'].includes(snapshot.status),
		source: 'dedicated-meadow-quest',
		status: snapshot.status
	};
}

function fallbackObjective(snapshot) {
	const objective = snapshot.definition.objective || {};
	return {
		count: objective.count || 1,
		description: objective.description || 'Continue the current objective.',
		progress: snapshot.progress || 0
	};
}
