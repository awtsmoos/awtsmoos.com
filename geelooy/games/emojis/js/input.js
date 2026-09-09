//B"H
//Boruch Hashem
//Blessed be He

import { shoot } from './combat.js';
import { dom } from './dom.js';
import { isGamePaused, isPlaying } from './game.js';
import { bindEmojiViewport } from './runtime/viewport.js';
import { state } from './state.js';

/**
 * @file input.js
 * @description Owns Emoji War pointer and keyboard intent while viewport sizing lives in its own runtime module.
 * The Awtsmoos renews hand and key beyond every finite event; Awtsmoos.com keeps gameplay input scoped to the arcade surface and inert while paused.
 *
 * Invariants:
 * - Pointer movement maps rendered canvas coordinates to intrinsic gameplay coordinates.
 * - Paused or terminal runs cannot move or fire the player.
 * - Browser scrolling is prevented only for Space while active gameplay deliberately consumes it.
 * - Viewport ownership is delegated to the focused runtime adapter.
 */
const pressedKeys = new Set();

/** Bind page-lifetime gameplay input and the responsive viewport adapter once. */
export function bindGameInput() {
	dom.canvas.addEventListener('pointerdown', handlePointerStart);
	dom.canvas.addEventListener('pointermove', handlePointerMove);
	window.addEventListener('pointerup', handlePointerEnd);
	window.addEventListener('pointercancel', handlePointerEnd);
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', event => pressedKeys.delete(event.code));
	bindEmojiViewport();
	window.setInterval(updateKeyboardMovement, 16);
}

/** Begin one primary pointer gesture only while the simulation accepts control. */
function handlePointerStart(event) {
	if (!canControl()) return;
	state.isTouching = true;
	movePlayerToPointer(event);
	shoot();
	try {
		dom.canvas.setPointerCapture?.(event.pointerId);
	} catch {
		// Pointer capture is optional; the global pointer-up path still releases fire.
	}
}

/** Track one held pointer without moving a paused or completed player. */
function handlePointerMove(event) {
	if (!state.isTouching || !canControl()) return;
	movePlayerToPointer(event);
}

/** Release held-fire intent for every pointer termination path. */
function handlePointerEnd() {
	state.isTouching = false;
}

/** Convert CSS-pixel pointer geometry into intrinsic canvas gameplay coordinates. */
function movePlayerToPointer(event) {
	if (!state.player) return;
	const rect = dom.canvas.getBoundingClientRect();
	const scaleX = dom.canvas.width / Math.max(1, rect.width);
	const scaleY = dom.canvas.height / Math.max(1, rect.height);
	state.player.x = (event.clientX - rect.left) * scaleX;
	state.player.y = (event.clientY - rect.top) * scaleY;
}

/** Record gameplay keys and consume Space only when firing is truly available. */
function handleKeyDown(event) {
	pressedKeys.add(event.code);
	if (event.code === 'Space' && canControl()) {
		event.preventDefault();
		shoot();
	}
}

/** Apply held keyboard movement without waking a paused run. */
function updateKeyboardMovement() {
	if (!canControl() || !state.player) return;
	const speed = 9;
	state.player.x += axis('ArrowRight', 'KeyD', 'ArrowLeft', 'KeyA') * speed;
	state.player.y += axis('ArrowDown', 'KeyS', 'ArrowUp', 'KeyW') * speed;
}

/** Collapse two positive and two negative bindings into one signed direction. */
function axis(positiveA, positiveB, negativeA, negativeB) {
	return Number(pressedKeys.has(positiveA) || pressedKeys.has(positiveB))
		- Number(pressedKeys.has(negativeA) || pressedKeys.has(negativeB));
}

/** Whether gameplay input is currently allowed to mutate the player. */
function canControl() {
	return isPlaying() && !isGamePaused();
}
