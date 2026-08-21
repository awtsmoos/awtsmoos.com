// B"H
// Boruch Hashem
// Blessed is He
import { followStickOrigin } from './stickOrigin.js';
import { joystickResponse } from './stickResponse.js';

/**
 * The Awtsmoos lets the moving hand discover a center, then lets that vessel follow only when distance asks;
 * Awtsmoos.com keeps fine motion anchored while long one-thumb sweeps never abandon the visible control behind.
 * Canvas capture preserves one coherent pointer while menus and buttons remain outside the movement path.
 */
export function bindStick(world) {
	const surface = document.getElementById('game');
	const stick = document.getElementById('stick');
	const nub = stick?.querySelector('i');
	const touch = createTouchState();
	if (!surface || !stick || !nub) return touch;

	surface.addEventListener('pointerdown', event => begin(event, surface, stick, nub, touch, world));
	surface.addEventListener('pointermove', event => move(event, surface, stick, nub, touch, world));
	surface.addEventListener('pointerup', event => end(event, surface, stick, nub, touch, world));
	surface.addEventListener('pointercancel', event => end(event, surface, stick, nub, touch, world));
	surface.addEventListener('lostpointercapture', () => reset(stick, nub, touch, world));
	window.addEventListener('blur', () => reset(stick, nub, touch, world));
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) reset(stick, nub, touch, world);
	});
	return touch;
}

function createTouchState() {
	return {
		active: false,
		pointerId: null,
		originX: 0,
		originY: 0
	};
}

function begin(event, surface, stick, nub, touch, world) {
	if (touch.active || !event.isPrimary) return;
	if (event.pointerType === 'mouse' && event.button !== 0) return;
	event.preventDefault();
	touch.active = true;
	touch.pointerId = event.pointerId;
	touch.originX = event.clientX;
	touch.originY = event.clientY;
	placeStick(stick, touch.originX, touch.originY);
	stick.classList.add('active');
	surface.setPointerCapture(event.pointerId);
	move(event, surface, stick, nub, touch, world);
}

function move(event, surface, stick, nub, touch, world) {
	if (!touch.active || event.pointerId !== touch.pointerId) return;
	if (!surface.hasPointerCapture(event.pointerId)) return;
	event.preventDefault();
	const radius = stickRadius();
	const origin = followStickOrigin(
		touch.originX,
		touch.originY,
		event.clientX,
		event.clientY,
		radius
	);
	if (origin.changed) {
		touch.originX = origin.x;
		touch.originY = origin.y;
		placeStick(stick, origin.x, origin.y);
	}
	const response = joystickResponse(
		touch.originX,
		touch.originY,
		event.clientX,
		event.clientY,
		radius
	);
	world.input.x = response.x;
	world.input.y = response.y;
	nub.style.transform = `translate3d(${response.knobX}px, ${response.knobY}px, 0)`;
}

function placeStick(stick, x, y) {
	stick.style.setProperty('--stick-x', `${x}px`);
	stick.style.setProperty('--stick-y', `${y}px`);
}

function end(event, surface, stick, nub, touch, world) {
	if (event.pointerId !== touch.pointerId) return;
	event.preventDefault();
	if (surface.hasPointerCapture(event.pointerId)) surface.releasePointerCapture(event.pointerId);
	reset(stick, nub, touch, world);
}

function reset(stick, nub, touch, world) {
	touch.active = false;
	touch.pointerId = null;
	world.input.x = 0;
	world.input.y = 0;
	nub.style.transform = '';
	stick.classList.remove('active');
}

function stickRadius() {
	return Math.max(48, Math.min(68, Math.min(window.innerWidth, window.innerHeight) * 0.14));
}
