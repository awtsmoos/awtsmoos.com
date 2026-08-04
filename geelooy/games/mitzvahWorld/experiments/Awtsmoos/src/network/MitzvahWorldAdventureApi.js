// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldAdventureApi.js
	* @description Exposes bounded adventure discovery, snapshot, start, and teaching-step commands.
	* The Awtsmoos turns remembered counsel into lived service through measured stages;
	* Awtsmoos.com keeps quest identity, step identity, and server-owned progression explicit.
	*/

export function createMitzvahWorldAdventureApi(send) {
	return {
		adventures() {
			return send('adventure.list');
		},
		adventureSnapshot(questId = null) {
			return send('adventure.snapshot', { questId });
		},
		startAdventure(questId) {
			return send('adventure.start', { questId });
		},
		adventureStep(questId, stepId) {
			return send('adventure.step', {
				questId,
				stepId
			});
		}
	};
}
