//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the touch joystick vessel in this instant, revealing
 * its focused js controls service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { updateTouchAim } from './touchAimMemory.js';

/**
 * B"H
 * Android-grade analog joystick.
 *
 * Chapter 51: the thumb draws a circle of command. Movement is softened, aim is
 * remembered, dive is intentional, and the nub follows without browser ghosts.
 */
export function touchJoystick(doc, state) {
	const stick = doc.getElementById('stick');
	const nub = stick?.querySelector('span');
	if (!stick || !nub) return;
	const move = event => {
		event.preventDefault();
		const r = stick.getBoundingClientRect();
		const rawX = event.clientX - r.left - r.width / 2;
		const rawY = event.clientY - r.top - r.height / 2;
		const radius = Math.min(r.width, r.height) * 0.38;
		const c = clampCircle(rawX, rawY, radius);
		const mag = Math.hypot(c.x, c.y) / radius;
		const ax = mag < 0.14 ? 0 : c.x / radius;
		const ay = mag < 0.14 ? 0 : c.y / radius;
		state.x = Math.abs(ax) < 0.16 ? 0 : curve(ax);
		state.y = Math.abs(ay) < 0.16 ? 0 : curve(ay);
		state.aimX = ax;
		state.aimY = ay;
		state.down = ay > 0.5;
		state.jump = ay < -0.55;
		updateTouchAim(state, ax, ay, mag);
		nub.style.transform = `translate(${c.x}px,${c.y}px)`;
	};
	const end = event => {
		event?.preventDefault?.();
		state.x = state.y = state.aimX = state.aimY = 0;
		state.down = state.jump = false;
		nub.style.transform = 'translate(0,0)';
	};
	stick.addEventListener(
		'pointerdown',
		event => {
			stick.setPointerCapture?.(event.pointerId);
			move(event);
		},
		{ passive: false }
	);
	stick.addEventListener('pointermove', move, { passive: false });
	stick.addEventListener('pointerup', end, { passive: false });
	stick.addEventListener('pointercancel', end, { passive: false });
}

function curve(v) {
	return Math.sign(v) * Math.min(1, Math.abs(v) ** 0.82);
}
function clampCircle(x, y, radius) {
	const len = Math.hypot(x, y);
	if (len <= radius) return { x, y };
	const s = radius / len;
	return { x: x * s, y: y * s };
}
