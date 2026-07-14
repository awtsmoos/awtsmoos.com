// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyAmbientField
 * @description
 * The Awtsmoos renews every point of attention without turning motion into noise.
 * Awtsmoos.com receives one restrained pointer field shared by eligible routes.
 */

const POINTER_QUERY = '(pointer: fine)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const CENTER = Object.freeze({ x: 50, y: 22 });
const BOUND_ATTRIBUTE = 'gAmbientBound';

/**
 * Binds one animation-frame pointer stream to the shared shell.
 * @param {Document} root Active route document.
 * @returns {() => void} Cleanup function for tests or route replacement.
 */
export function bindAmbientField(root = document) {
	const body = root.body;
	const view = root.defaultView;
	if (!body || body.dataset[BOUND_ATTRIBUTE] === 'true') return () => {};
	body.dataset[BOUND_ATTRIBUTE] = 'true';
	if (!view || !isInteractivePointer(view)) {
		setCoordinates(body, CENTER);
		return () => release(body);
	}

	let frame = 0;
	let nextPoint = CENTER;
	const paint = () => {
		frame = 0;
		setCoordinates(body, nextPoint);
	};
	const onPointerMove = event => {
		nextPoint = percentagePoint(view, event.clientX, event.clientY);
		if (!frame) frame = view.requestAnimationFrame(paint);
	};
	const onPointerLeave = () => {
		nextPoint = CENTER;
		if (!frame) frame = view.requestAnimationFrame(paint);
	};

	setCoordinates(body, CENTER);
	view.addEventListener('pointermove', onPointerMove, { passive: true });
	root.documentElement.addEventListener('pointerleave', onPointerLeave, { passive: true });

	return () => {
		view.removeEventListener('pointermove', onPointerMove);
		root.documentElement.removeEventListener('pointerleave', onPointerLeave);
		if (frame) view.cancelAnimationFrame(frame);
		release(body);
	};
}

function isInteractivePointer(view) {
	return view.matchMedia(POINTER_QUERY).matches && !view.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function percentagePoint(view, clientX, clientY) {
	return {
		x: Math.max(0, Math.min(100, clientX / view.innerWidth * 100)),
		y: Math.max(0, Math.min(100, clientY / view.innerHeight * 100))
	};
}

function setCoordinates(body, point) {
	body.style.setProperty('--g-pointer-x', `${point.x.toFixed(2)}%`);
	body.style.setProperty('--g-pointer-y', `${point.y.toFixed(2)}%`);
}

function release(body) {
	delete body.dataset[BOUND_ATTRIBUTE];
}
