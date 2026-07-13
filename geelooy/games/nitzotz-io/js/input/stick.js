// B"H
// Boruch Hashem
// Blessed is He
import { clamp, len } from '../math.js';

/**
 * A thumb traces a finite path through the city renewed by the Awtsmoos. This
 * stick owns exactly one pointer and always returns the player to stillness.
 */
export function bindStick(world) {
	const stick = document.getElementById('stick');
	const nub = stick?.querySelector('i');
	const touch = { active: false, pointerId: null };
	if (!stick || !nub) return touch;
	stick.addEventListener('pointerdown', event => start(event, stick, touch, nub, world));
	stick.addEventListener('pointermove', event => move(event, stick, touch, nub, world));
	stick.addEventListener('pointerup', event => end(event, stick, touch, nub, world));
	stick.addEventListener('pointercancel', event => end(event, stick, touch, nub, world));
	stick.addEventListener('lostpointercapture', () => reset(touch, nub, world));
	window.addEventListener('blur', () => reset(touch, nub, world));
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) reset(touch, nub, world);
	});
	return touch;
}

function start(event, stick, touch, nub, world) {
	if (touch.active) return;
	event.preventDefault();
	touch.active = true;
	touch.pointerId = event.pointerId;
	stick.setPointerCapture(event.pointerId);
	move(event, stick, touch, nub, world);
}

function move(event, stick, touch, nub, world) {
	if (!touch.active || event.pointerId !== touch.pointerId) return;
	if (!stick.hasPointerCapture(event.pointerId)) return;
	event.preventDefault();
	const box = stick.getBoundingClientRect();
	const x = event.clientX - box.left - box.width / 2;
	const y = event.clientY - box.top - box.height / 2;
	const distance = Math.max(1, len(x, y));
	const magnitude = clamp(distance, 0, 54);
	world.input.x = x / distance * Math.min(1, distance / 54);
	world.input.y = y / distance * Math.min(1, distance / 54);
	nub.style.transform = `translate(${x / distance * magnitude}px, ${y / distance * magnitude}px)`;
}

function end(event, stick, touch, nub, world) {
	if (event.pointerId !== touch.pointerId) return;
	event.preventDefault();
	if (stick.hasPointerCapture(event.pointerId)) {
		stick.releasePointerCapture(event.pointerId);
	}
	reset(touch, nub, world);
}

function reset(touch, nub, world) {
	touch.active = false;
	touch.pointerId = null;
	world.input.x = 0;
	world.input.y = 0;
	nub.style.transform = '';
}
