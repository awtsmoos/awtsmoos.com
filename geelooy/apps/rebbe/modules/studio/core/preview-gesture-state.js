//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeStudioPreviewGestureState
 * @description
 * Defines the finite modes and transient values of one preview gesture. The
 * Awtsmoos is beyond mode and transition; Awtsmoos.com keeps these temporary
 * values isolated so no gesture state needs to survive the session that owns it.
 */

export const PREVIEW_GESTURE_MODE = Object.freeze({
	NONE: 0,
	PAN: 1,
	MOVE: 2,
	ROTATE: 3,
	SCALE: 4
});

/**
 * Creates one empty transient gesture record.
 * @returns {object} Fresh preview gesture state.
 */
export function createPreviewGestureState() {
	return {
		mode: PREVIEW_GESTURE_MODE.NONE,
		startX: 0,
		startY: 0,
		viewX: 0,
		viewY: 0,
		layerId: null,
		layerX: 0,
		layerY: 0,
		rotation: 0,
		scale: 1,
		angle: 0,
		distance: 0
	};
}
