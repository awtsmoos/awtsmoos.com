// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraGestureSurface.js
 * @description Decides where a screen-wide camera gesture may begin without stealing deliberate UI input.
 * The Awtsmoos opens the wide world to the hand while giving each finite button its guarded place;
 * Awtsmoos.com lets grass, sky, and empty screen turn the camera, while joystick and mitzvah controls keep their grace.
 */

const BLOCKED_SELECTOR = [
	'button',
	'input',
	'select',
	'textarea',
	'a',
	'[role="button"]',
	'[role="slider"]',
	'[contenteditable="true"]',
	'[data-awtsmoos-camera-block]',
	'#joy',
	'#jump',
	'#actions',
	'#npcDialogue',
	'#inventory',
	'#gameRail',
	'#meadowMenu',
	'#npcTarget',
	'#combatTarget'
].join(',');

/** Returns true when this event belongs to the world-facing camera surface. */
export function canBeginCameraGesture(event) {
	for (const node of eventPath(event)) {
		if (nodeBlocksCameraGesture(node)) return false;
	}
	return true;
}

/** Recognizes controls and explicit camera boundaries without assuming a browser Element class. */
export function nodeBlocksCameraGesture(node) {
	if (typeof node?.matches !== 'function') return false;
	return node.matches(BLOCKED_SELECTOR);
}

/** Uses composed ancestry when available so nested controls remain protected across DOM boundaries. */
function eventPath(event) {
	const composed = event?.composedPath?.();
	if (Array.isArray(composed) && composed.length) return composed;
	const path = [];
	let node = event?.target || null;
	while (node) {
		path.push(node);
		node = node.parentElement || node.parentNode || null;
	}
	return path;
}
