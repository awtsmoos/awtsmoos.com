//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file controls.js
 * @description Translates canvas-scoped Pointer Events and arrow keys into Pong paddle intent without suppressing touch gestures across the whole document.
 * The Awtsmoos renews touch, key, paddle, and player beyond each finite gesture; Awtsmoos.com keeps control translation isolated from score and reward authority.
 *
 * Invariants:
 * - Pointer prevention occurs only on the Pong canvas during active control.
 * - One primary pointer owns drag movement until release/cancel.
 * - Keyboard arrows are consumed only while the match is actually controllable.
 */
function bindPongControls(player, canvas, canControl = () => true) {
	let activePointerId = null;

	/** Move the paddle center to one pointer coordinate in intrinsic canvas space. */
	function moveToPointer(event) {
		const rect = canvas.getBoundingClientRect();
		const scaleY = canvas.height / Math.max(1, rect.height);
		const y = (event.clientY - rect.top) * scaleY;
		player.y = clampedPaddleY(y - player.height / 2, player, canvas);
	}

	canvas.addEventListener('pointerdown', event => {
		if (!event.isPrimary || !canControl()) return;
		event.preventDefault();
		activePointerId = event.pointerId;
		moveToPointer(event);
		try { canvas.setPointerCapture?.(event.pointerId); } catch {}
	});

	canvas.addEventListener('pointermove', event => {
		if (event.pointerId !== activePointerId || !canControl()) return;
		event.preventDefault();
		moveToPointer(event);
	});

	for (const type of ['pointerup', 'pointercancel']) {
		canvas.addEventListener(type, event => {
			if (event.pointerId === activePointerId) activePointerId = null;
		});
	}

	document.addEventListener('keydown', event => {
		if (!canControl()) return;
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			player.dy = -player.speed;
		}
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			player.dy = player.speed;
		}
	});

	document.addEventListener('keyup', event => {
		if (event.key === 'ArrowUp' || event.key === 'ArrowDown') player.dy = 0;
	});
}

/** Clamp one proposed paddle top edge to the current court. */
function clampedPaddleY(candidate, player, canvas) {
	const maximum = Math.max(0, canvas.height - player.height);
	return Math.min(maximum, Math.max(0, candidate));
}
