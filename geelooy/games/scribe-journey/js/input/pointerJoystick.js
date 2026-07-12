// B"H

const KEY_BY_DIRECTION = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };

function directionFromVector(x, y, deadZone) {
	if (Math.hypot(x, y) < deadZone) return null;
	if (Math.abs(x) > Math.abs(y)) return x < 0 ? 'left' : 'right';
	return y < 0 ? 'up' : 'down';
}

function capturePointer(element, pointerId) {
	try {
		element.setPointerCapture?.(pointerId);
	} catch {
		// Synthetic tests and interrupted browser gestures may not own capture.
	}
}

/**
 * Makes one touch surface behave like a dependable handheld joystick. Pointer
 * capture keeps the intention alive only while the same finger owns the vessel.
 */
export function bindPointerJoystick({ inputState }) {
	const pad = document.getElementById('joystick-pad');
	const thumb = document.getElementById('joystick-thumb');
	if (!pad || !thumb) return () => {};

	let activePointer = null;
	let currentDirection = null;
	const applyDirection = direction => {
		if (direction === currentDirection) return;
		currentDirection = direction;
		if (!direction) inputState.clearSource('pointer:joystick');
		else inputState.setSource('pointer:joystick', KEY_BY_DIRECTION[direction], direction);
		pad.dataset.direction = direction || 'idle';
	};

	const updateFromPointer = event => {
		const bounds = pad.getBoundingClientRect();
		const radius = Math.min(bounds.width, bounds.height) / 2;
		const x = event.clientX - (bounds.left + bounds.width / 2);
		const y = event.clientY - (bounds.top + bounds.height / 2);
		const distance = Math.hypot(x, y) || 1;
		const travel = Math.min(radius * 0.34, distance);
		thumb.style.setProperty('--stick-x', `${x / distance * travel}px`);
		thumb.style.setProperty('--stick-y', `${y / distance * travel}px`);
		applyDirection(directionFromVector(x, y, radius * 0.2));
	};

	const release = event => {
		if (activePointer !== null && event?.pointerId !== activePointer) return;
		activePointer = null;
		thumb.style.setProperty('--stick-x', '0px');
		thumb.style.setProperty('--stick-y', '0px');
		applyDirection(null);
	};

	const onPointerDown = event => {
		event.preventDefault();
		if (activePointer !== null) return;
		activePointer = event.pointerId;
		capturePointer(pad, event.pointerId);
		updateFromPointer(event);
		navigator.vibrate?.(8);
	};
	const onPointerMove = event => {
		if (event.pointerId !== activePointer) return;
		event.preventDefault();
		updateFromPointer(event);
	};

	pad.addEventListener('pointerdown', onPointerDown);
	pad.addEventListener('pointermove', onPointerMove);
	pad.addEventListener('pointerup', release);
	pad.addEventListener('pointercancel', release);
	pad.addEventListener('lostpointercapture', release);
	pad.addEventListener('contextmenu', event => event.preventDefault());
	return () => release();
}
