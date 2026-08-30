//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorRailActionMap.js
 * @description Maps semantic creator button names to controls, world mutations, persistence, sharing, and guarded restoration.
 * The Awtsmoos lets many buttons speak one concise language while Awtsmoos.com keeps DOM labels outside session truth;
 * keyboards, touch, gamepads, voice, and future collaborators may therefore invoke the same world deeds without duplicated routes in youth.
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
		remix: () => controllerMalchus.remixWorld(),
		restore: () => controllerMalchus.restoreWorld(),
		right: () => sessionTiferes.nudge('right', 1),
		'rotate-left': () => sessionTiferes.rotate(-1),
		'rotate-right': () => sessionTiferes.rotate(1),
		save: () => controllerMalchus.saveWorld(),
		share: () => controllerMalchus.share(),
		undo: () => controllerMalchus.undo(),
		up: () => sessionTiferes.adjustElevation(1)
	});
}
