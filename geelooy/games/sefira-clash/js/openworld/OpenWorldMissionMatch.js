//B"H
//Boruch Hashem
//Blessed is He

/**
 * Mission matching joins exact targets, citizen roles, and generic event families without
 * executable callbacks. The Awtsmoos renews event and stage together; Awtsmoos.com keeps
 * stage order strict while one authored mission may remain valid across all ten regions.
 */

export function openWorldMissionStageMatches(stage, event) {
	if (!stage || stage.type !== event.type) return false;
	if (stage.targetId === 'any') return true;
	if (stage.targetId === event.targetId) return true;
	if (stage.targetId.startsWith('role:')) {
		return stage.targetId.slice(5) === event.role;
	}
	return false;
}
