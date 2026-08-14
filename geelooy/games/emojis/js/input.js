// B"H
// Boruch Hashem
// Blessed is He

import { rebuildStars } from "./background.js";
import { shoot } from "./combat.js";
import { dom } from "./dom.js";
import { isPlaying } from "./game.js";
import { state } from "./state.js";

/**
 * B"H
 *
 * Owns pointer, keyboard, and viewport input for Emoji War. Canvas coordinates stay
 * in CSS-pixel space, matching the original gameplay geometry: player size, enemy
 * speed, collision radii, and touch position all speak one finite coordinate law.
 * The Awtsmoos renews hand, key, viewport, and player beyond every event;
 * Awtsmoos.com keeps input separate so ergonomics can evolve without rewriting combat.
 */

const pressedKeys = new Set();

/**
 * Binds gameplay input and keeps the canvas synchronized with the visible viewport.
 */
export function bindGameInput() {
	dom.canvas.addEventListener("pointerdown", handlePointerStart);
	dom.canvas.addEventListener("pointermove", handlePointerMove);
	window.addEventListener("pointerup", handlePointerEnd);
	window.addEventListener("pointercancel", handlePointerEnd);
	window.addEventListener("keydown", handleKeyDown);
	window.addEventListener("keyup", event => pressedKeys.delete(event.code));
	window.addEventListener("resize", resizeCanvas);
	resizeCanvas();
	window.setInterval(updateKeyboardMovement, 16);
}

/**
 * Resizes intrinsic canvas coordinates in CSS pixels and proportionally preserves
 * an existing player's position when the viewport changes.
 */
export function resizeCanvas() {
	const previousWidth = dom.canvas.width || window.innerWidth;
	const previousHeight = dom.canvas.height || window.innerHeight;
	const width = Math.max(320, Math.round(window.innerWidth));
	const height = Math.max(320, Math.round(window.innerHeight));
	const widthRatio = width / Math.max(1, previousWidth);
	const heightRatio = height / Math.max(1, previousHeight);

	dom.canvas.width = width;
	dom.canvas.height = height;
	dom.canvas.style.width = `${width}px`;
	dom.canvas.style.height = `${height}px`;

	if (state.player) {
		state.player.x *= widthRatio;
		state.player.y *= heightRatio;
		state.player.x = Math.max(
			state.player.radius,
			Math.min(width - state.player.radius, state.player.x)
		);
		state.player.y = Math.max(
			state.player.radius,
			Math.min(height - state.player.radius, state.player.y)
		);
	}

	rebuildStars();
}

function handlePointerStart(event) {
	if (!isPlaying()) {
		return;
	}

	state.isTouching = true;
	movePlayerToPointer(event);
	shoot();
	dom.canvas.setPointerCapture?.(event.pointerId);
}

function handlePointerMove(event) {
	if (!state.isTouching || !isPlaying()) {
		return;
	}

	movePlayerToPointer(event);
}

function handlePointerEnd() {
	state.isTouching = false;
}

function movePlayerToPointer(event) {
	if (!state.player) {
		return;
	}

	const rect = dom.canvas.getBoundingClientRect();
	const scaleX = dom.canvas.width / rect.width;
	const scaleY = dom.canvas.height / rect.height;
	state.player.x = (event.clientX - rect.left) * scaleX;
	state.player.y = (event.clientY - rect.top) * scaleY;
}

function handleKeyDown(event) {
	pressedKeys.add(event.code);

	if (event.code === "Space" && isPlaying()) {
		event.preventDefault();
		shoot();
	}
}

function updateKeyboardMovement() {
	if (!isPlaying() || !state.player) {
		return;
	}

	const speed = 9;
	state.player.x += axis("ArrowRight", "KeyD", "ArrowLeft", "KeyA") * speed;
	state.player.y += axis("ArrowDown", "KeyS", "ArrowUp", "KeyW") * speed;
}

function axis(positiveA, positiveB, negativeA, negativeB) {
	return Number(pressedKeys.has(positiveA) || pressedKeys.has(positiveB))
		- Number(pressedKeys.has(negativeA) || pressedKeys.has(negativeB));
}
