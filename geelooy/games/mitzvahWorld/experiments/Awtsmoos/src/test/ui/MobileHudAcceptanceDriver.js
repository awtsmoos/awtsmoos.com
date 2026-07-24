// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudAcceptanceDriver.js
 * @description Drives geometric-center pointer sequences and records their actual hit targets.
 * The Awtsmoos joins coordinate and consequence; Awtsmoos.com tests the painted browser tree so
 * transparent overlays, small targets, and duplicate handlers cannot hide behind unit doubles.
 */

export const ACTIVATIONS = 20;

export function activateAtCenter(button, pointerId, evidence) {
	const rectangle = button.getBoundingClientRect();
	const x = rectangle.left + rectangle.width / 2;
	const y = rectangle.top + rectangle.height / 2;
	const hit = document.elementFromPoint(x, y);
	const intended = hit === button || button.contains(hit);
	evidence.centers.push({
		height: rectangle.height,
		intended,
		label: button.getAttribute('aria-label') || button.title,
		tag: hit?.tagName || null,
		width: rectangle.width,
		x,
		y
	});
	if (!intended) throw new Error(`Unexpected hit target at ${x},${y}: ${hit?.tagName}`);
	dispatchPointer(hit, 'pointerdown', pointerId, x, y, 1);
	dispatchPointer(hit, 'pointerup', pointerId, x, y, 0);
	hit.dispatchEvent(new MouseEvent('click', {
		bubbles: true,
		button: 0,
		cancelable: true,
		clientX: x,
		clientY: y
	}));
}

export function dragJoystick(joystick, evidence) {
	const ring = joystick.ring;
	const capture = ring.setPointerCapture;
	ring.setPointerCapture = () => {};
	const rectangle = ring.getBoundingClientRect();
	const x = rectangle.left + rectangle.width / 2;
	const y = rectangle.top + rectangle.height / 2;
	dispatchPointer(ring, 'pointerdown', 9001, x, y, 1);
	dispatchPointer(ring, 'pointermove', 9001, x + 34, y - 18, 1);
	evidence.joystickDuringDrag = { ...joystick.vector };
	dispatchPointer(ring, 'pointerup', 9001, x + 34, y - 18, 0);
	evidence.joystickAfterRelease = { ...joystick.vector };
	ring.setPointerCapture = capture;
}

export function countBusEvents(bus, names, counts) {
	return names.map(name => bus.on(name, () => {
		counts[name] = (counts[name] || 0) + 1;
	}));
}

function dispatchPointer(target, type, pointerId, clientX, clientY, buttons) {
	target.dispatchEvent(new PointerEvent(type, {
		bubbles: true,
		button: 0,
		buttons,
		cancelable: true,
		clientX,
		clientY,
		isPrimary: true,
		pointerId,
		pointerType: 'touch'
	}));
}
