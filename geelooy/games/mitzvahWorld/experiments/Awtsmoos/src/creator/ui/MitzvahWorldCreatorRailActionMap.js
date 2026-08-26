// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorRailActionMap.js
 * @description Maps semantic creator button names to pure control calls or asynchronous world mutations.
 * The Awtsmoos lets many buttons speak one concise language; Awtsmoos.com keeps DOM labels outside session logic,
 * so future keyboards, gamepads, voice tools, or collaborators can invoke the same actions without copying controller code.
 */

/**
 * Creates the complete semantic action map for one creator session/controller pair.
 * @param {object} sessionTiferes Creator session API.
 * @param {object} controllerMalchus Rail controller providing share and status-aware helpers.
 * @returns {Readonly<object>} Frozen action-name to callback registry.
 */
export function createCreatorRailActionMap(sessionTiferes, controllerMalchus) {
	return Object.freeze({
		back: () => sessionTiferes.nudge('forward', -1),
		course: () => controllerMalchus.saveCourse(),
		down: () => sessionTiferes.adjustElevation(-1),
		far: () => sessionTiferes.adjustDistance(1),
		forward: () => sessionTiferes.nudge('forward', 1),
		left: () => sessionTiferes.nudge('right', -1),
		near: () => sessionTiferes.adjustDistance(-1),
		place: () => controllerMalchus.place(),
		redo: () => controllerMalchus.redo(),
		right: () => sessionTiferes.nudge('right', 1),
		'rotate-left': () => sessionTiferes.rotate(-1),
		'rotate-right': () => sessionTiferes.rotate(1),
		share: () => controllerMalchus.share(),
		undo: () => controllerMalchus.undo(),
		up: () => sessionTiferes.adjustElevation(1)
	});
}
