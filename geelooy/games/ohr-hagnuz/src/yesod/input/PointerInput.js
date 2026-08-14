//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PointerInput.js
 * @description
 * The Awtsmoos renews pointer, camera, and destination in one logical measure;
 * Awtsmoos.com keeps physical DPR in rendering alone, so touch finds visible treasure.
 * This module binds walking and battle selection without leaking HUD taps into the world.
 */

import { State } from '../../binah/State.js';
import { battleMoveLayout, moveIndexAt } from '../../tiferet/render/BattleMoveLayout.js';
import { logicalCanvasPoint, worldTileFromPointer } from './PointerCoordinates.js';

const UI_GUARD_SELECTOR = [
	'button',
	'.ohr-panel',
	'.ohr-dialogue',
	'.ohr-world-card',
	'.revelation-quest-card',
	'.revelation-minimap',
	'.revelation-vitality',
	'.revelation-event-log',
	'.revelation-pardes',
	'.revelation-companions',
	'.revelation-action-bar',
	'.revelation-dock'
].join(', ');

/** Returns true when a pointer belongs to an interactive HUD vessel. */
function pointerBelongsToUi(event) {
	return Boolean(event.target?.closest?.(UI_GUARD_SELECTOR));
}

/** Finds a battle move using the same CSS-pixel viewport used by its renderer. */
function battleIndexAtPoint(event, canvas) {
	const point = logicalCanvasPoint(event, canvas);
	if (!point.inside) {
		return null;
	}
	return moveIndexAt(
		point.x,
		point.y,
		battleMoveLayout(point.width, point.height)
	);
}

/**
 * Handles one canvas/shell pointer press without mixing physical and logical pixels.
 * @param {PointerEvent} event Browser pointer event.
 * @param {HTMLCanvasElement} canvas Object-layer canvas.
 * @param {object} handlers Input action handlers.
 */
export function handlePointerDown(event, canvas, handlers) {
	if (pointerBelongsToUi(event)) {
		return;
	}
	event.preventDefault?.();
	event.stopPropagation?.();
	if (State.isUiBlocking()) {
		State.releaseIntents();
		return;
	}
	if (State.ActiveRealm === 'DEBATE') {
		const index = battleIndexAtPoint(event, canvas);
		if (index !== null) {
			handlers.commitBattle(index);
		}
		return;
	}
	const tile = worldTileFromPointer(
		event,
		canvas,
		State.Hero,
		State.Resolution
	);
	if (!tile) {
		return;
	}
	canvas.setPointerCapture?.(event.pointerId);
	handlers.setPath(tile.x, tile.y);
}

/** Binds pointer controls once to the game shell while preserving browser safety guards. */
export function bindPointerInput(handlers) {
	const shell = document.getElementById('game-shell');
	const canvas = document.getElementById('layer-obj');
	const target = shell || canvas;
	if (!target || !canvas) {
		return false;
	}
	target.addEventListener(
		'pointerdown',
		event => handlePointerDown(event, canvas, handlers),
		{ passive: false }
	);
	for (const type of ['contextmenu', 'selectstart', 'dragstart']) {
		target.addEventListener(type, event => event.preventDefault(), { passive: false });
	}
	return true;
}
