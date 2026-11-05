//B"H
//Boruch Hashem
//Blessed be He

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
		'object-prev': () => sessionTiferes.cycleObject(-1),
		'object-next': () => sessionTiferes.cycleObject(1),
		'object-x-minus': () => objectMutation(controllerMalchus, 'Moving…', () => sessionTiferes.nudgeObject('x', -1)),
		'object-x-plus': () => objectMutation(controllerMalchus, 'Moving…', () => sessionTiferes.nudgeObject('x', 1)),
		'object-y-minus': () => objectMutation(controllerMalchus, 'Moving…', () => sessionTiferes.nudgeObject('y', -1)),
		'object-y-plus': () => objectMutation(controllerMalchus, 'Moving…', () => sessionTiferes.nudgeObject('y', 1)),
		'object-z-minus': () => objectMutation(controllerMalchus, 'Moving…', () => sessionTiferes.nudgeObject('z', -1)),
		'object-z-plus': () => objectMutation(controllerMalchus, 'Moving…', () => sessionTiferes.nudgeObject('z', 1)),
		'object-rotate-left': () => objectMutation(controllerMalchus, 'Rotating…', () => sessionTiferes.rotateObject(-1)),
		'object-rotate-right': () => objectMutation(controllerMalchus, 'Rotating…', () => sessionTiferes.rotateObject(1)),
		'object-scale-down': () => objectMutation(controllerMalchus, 'Scaling…', () => sessionTiferes.scaleObject(-1)),
		'object-scale-up': () => objectMutation(controllerMalchus, 'Scaling…', () => sessionTiferes.scaleObject(1)),
		'object-duplicate': () => objectMutation(controllerMalchus, 'Duplicating…', () => sessionTiferes.duplicateObject()),
		'object-delete': () => objectMutation(controllerMalchus, 'Deleting…', () => sessionTiferes.deleteObject()),
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

/** Routes one async world-object mutation through the controller's shared busy/error boundary. */
function objectMutation(controllerMalchus, pendingOhr, mutationDaas) {
	return controllerMalchus.mutate(pendingOhr, 'World object updated.', mutationDaas);
}
