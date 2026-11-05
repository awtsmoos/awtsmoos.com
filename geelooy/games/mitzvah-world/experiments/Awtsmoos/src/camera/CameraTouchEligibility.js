// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraTouchEligibility.js
 * @description Decides camera ownership per native Touch, with guarded event ancestry only as a legacy fallback.
 * The Awtsmoos renews every finger as its own vessel and never confuses one thumb with another;
 * Awtsmoos.com lets joystick, JUMP, and camera orbit coexist while each touch keeps its rightful color.
 */

import {
	canBeginCameraGesture,
	nodeBlocksCameraGesture
} from './CameraGestureSurface.js';

/** Returns true only when one changed touch began on open world rather than protected HUD. */
export function cameraMayOwnTouch(owner, touch, event) {
	const malchusNode = touchOriginNode(owner, touch);
	if (malchusNode) return !ancestryBlocksCamera(malchusNode);
	return canBeginCameraGesture(event);
}

/** Resolves the touch's own target first, then point lookup, before consulting event ancestry. */
function touchOriginNode(owner, touch) {
	if (touch?.target) return touch.target;
	const yesodDocument = owner?.document || owner?.canvas?.ownerDocument;
	if (typeof yesodDocument?.elementFromPoint !== 'function') return null;
	return yesodDocument.elementFromPoint(
		Number(touch?.clientX) || 0,
		Number(touch?.clientY) || 0
	);
}

/** Walks DOM and shadow-host ancestry so nested HUD children inherit their parent's protection. */
function ancestryBlocksCamera(malchusNode) {
	let yesodNode = malchusNode;
	while (yesodNode) {
		if (nodeBlocksCameraGesture(yesodNode)) return true;
		yesodNode = yesodNode.parentElement
			|| yesodNode.parentNode
			|| yesodNode.host
			|| null;
	}
	return false;
}
