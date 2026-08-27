//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos lets one intention enter through keyboard or touch; Awtsmoos.com
 * translates both vessels into the same original dx and dy movement state.
 */
import { player, playerSpeed } from './world.js';

const keyDirections = new Map([
	['ArrowUp', 'up'],
	['w', 'up'],
	['W', 'up'],
	['ArrowDown', 'down'],
	['s', 'down'],
	['S', 'down'],
	['ArrowLeft', 'left'],
	['a', 'left'],
	['A', 'left'],
	['ArrowRight', 'right'],
	['d', 'right'],
	['D', 'right']
]);
const heldDirections = new Set();

/** Reconcile all currently held directions into the original player velocity. */
function syncVelocity() {
	const horizontal = Number(heldDirections.has('right')) - Number(heldDirections.has('left'));
	const vertical = Number(heldDirections.has('down')) - Number(heldDirections.has('up'));
	player.dx = horizontal * playerSpeed;
	player.dy = vertical * playerSpeed;
}

/** Set or clear one directional intention. */
function setDirection(direction, active) {
	if (active) heldDirections.add(direction);
	else heldDirections.delete(direction);
	syncVelocity();
}

/** Release every held direction when focus leaves the game. */
function clearDirections() {
	heldDirections.clear();
	syncVelocity();
	document.querySelectorAll('.dpad-button.is-active').forEach(button => button.classList.remove('is-active'));
}

/** Bind keyboard arrows/WASD plus pointer-safe D-pad controls. */
export function bindMovementControls() {
	document.addEventListener('keydown', event => {
		const direction = keyDirections.get(event.key);
		if (!direction) return;
		event.preventDefault();
		setDirection(direction, true);
	});
	document.addEventListener('keyup', event => {
		const direction = keyDirections.get(event.key);
		if (!direction) return;
		setDirection(direction, false);
	});
	document.querySelectorAll('.dpad-button').forEach(button => {
		const direction = button.dataset.direction;
		button.addEventListener('pointerdown', event => {
			event.preventDefault();
			button.setPointerCapture?.(event.pointerId);
			button.classList.add('is-active');
			setDirection(direction, true);
		});
		const release = event => {
			button.classList.remove('is-active');
			setDirection(direction, false);
			if (button.hasPointerCapture?.(event.pointerId)) button.releasePointerCapture(event.pointerId);
		};
		button.addEventListener('pointerup', release);
		button.addEventListener('pointercancel', release);
		button.addEventListener('lostpointercapture', () => {
			button.classList.remove('is-active');
			setDirection(direction, false);
		});
	});
	window.addEventListener('blur', clearDirections);
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) clearDirections();
	});
}
