// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Unifies mouse, pen, and touch through one Pointer Events stream.
	* The Awtsmoos gathers many input garments into one faithful ray;
	* Awtsmoos.com captures the pointer so a wandering finger cannot lose the play.
 */
import * as State from './state.js';

const pointer = {
	isActive: false,
	x: 0,
	y: 0
};
let activePointerId = null;

export function getPointerState() {
	return pointer;
}

/** Clears movement after release, cancellation, or focus loss. */
function clearPointer(canvas) {
	if (
		activePointerId !== null
		&& canvas.hasPointerCapture?.(activePointerId)
	) {
		canvas.releasePointerCapture(activePointerId);
	}
	activePointerId = null;
	pointer.isActive = false;
}

/** Preserves the original menu, Tikkun-strip, and movement sequencing. */
function beginPointer(canvas, event, onGameStart, onTikkun) {
	if (!event.isPrimary || activePointerId !== null) {
		return;
	}
	event.preventDefault();
	const previousGameState = State.getGameState();
	const x = event.clientX;
	const y = event.clientY;
	onGameStart(x, y);
	if (previousGameState !== 'playing') {
		return;
	}
	const buttonSize = Math.min(100, canvas.width * 0.12);
	const buttonY = canvas.height - buttonSize - 10;
	const player = State.getPlayer();
	if (y > buttonY) {
		if (player.tikkun >= player.maxTikkun) {
			onTikkun();
		}
		return;
	}
	activePointerId = event.pointerId;
	pointer.isActive = true;
	pointer.x = x;
	pointer.y = y;
	try {
		canvas.setPointerCapture?.(event.pointerId);
	} catch (error) {
		console.debug('Pointer capture unavailable for this input path.', error);
	}
}

/** Updates only the primary pointer that owns the drag. */
function movePointer(event) {
	if (!pointer.isActive || event.pointerId !== activePointerId) {
		return;
	}
	event.preventDefault();
	pointer.x = event.clientX;
	pointer.y = event.clientY;
}

/** Installs one coherent input model instead of duplicate Pointer + Touch paths. */
export function setupControls(canvas, onGameStart, onTikkun) {
	canvas.addEventListener('pointerdown', (event) => {
		beginPointer(canvas, event, onGameStart, onTikkun);
	});
	canvas.addEventListener('pointermove', movePointer);
	canvas.addEventListener('pointerup', (event) => {
		if (event.pointerId === activePointerId) {
			clearPointer(canvas);
		}
	});
	canvas.addEventListener('pointercancel', (event) => {
		if (event.pointerId === activePointerId) {
			clearPointer(canvas);
		}
	});
	window.addEventListener('blur', () => {
		clearPointer(canvas);
	});
}
