//B"H
/** The Awtsmoos lets the musician grasp the mid band and see its true shape. */
import { eqResponseCurve } from './multitrackEqResponse.js';

const WIDTH = 232, HEIGHT = 72, MIN_DB = -18, MAX_DB = 18;

/** Maps a curve point into the small display vessel. */
function pointXY({ frequency, db }) {
	const x = Math.log10(frequency / 20) / 3 * WIDTH;
	const y = (MAX_DB - Math.max(MIN_DB, Math.min(MAX_DB, db))) / (MAX_DB - MIN_DB) * HEIGHT;
	return `${x.toFixed(1)},${y.toFixed(1)}`;
}

/**
 * Real response curve from the canonical EQ parameters (not a decoration).
 * Dragging the mid-band handle updates the shelf's own mid frequency/gain
 * inputs and fires their normal change events on release, so live retune,
 * undo and export all keep using the same single path.
 */
export function createEqCurve(effects, controls) {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
	svg.setAttribute('width', String(WIDTH)); svg.setAttribute('height', String(HEIGHT));
	svg.setAttribute('role', 'img');
	svg.setAttribute('aria-label', 'EQ frequency response. Drag to move the mid band.');
	svg.style.cssText = 'display:block;background:rgba(127,127,127,.12);border-radius:6px;touch-action:none;cursor:ew-resize';
	const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
	line.setAttribute('fill', 'none'); line.setAttribute('stroke', 'currentColor'); line.setAttribute('stroke-width', '1.6');
	const zero = document.createElementNS('http://www.w3.org/2000/svg', 'line');
	zero.setAttribute('x1', '0'); zero.setAttribute('x2', String(WIDTH));
	zero.setAttribute('y1', String(HEIGHT / 2)); zero.setAttribute('y2', String(HEIGHT / 2));
	zero.setAttribute('stroke', 'currentColor'); zero.setAttribute('opacity', '.3');
	svg.append(zero, line);
	const current = { ...effects };
	function draw() { line.setAttribute('points', eqResponseCurve(current).map(pointXY).join(' ')); }
	draw();
	const input = (key) => controls.querySelector(`[data-track-effect="${key}"]`);
	function fromEvent(event) {
		const rect = svg.getBoundingClientRect();
		const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
		const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
		current.midFrequency = Math.round(80 * (125 ** x));
		current.midGain = Math.round((MAX_DB - y * (MAX_DB - MIN_DB)) * 2) / 2;
		if (current.midGain === 0) current.midGain = .5;
		const f = input('midFrequency'), g = input('midGain');
		if (f) f.value = current.midFrequency;
		if (g) g.value = current.midGain;
		draw();
	}
	let dragging = false;
	svg.addEventListener('pointerdown', (event) => { dragging = true; svg.setPointerCapture?.(event.pointerId); fromEvent(event); });
	svg.addEventListener('pointermove', (event) => { if (dragging) fromEvent(event); });
	svg.addEventListener('pointerup', () => {
		if (!dragging) return; dragging = false;
		for (const key of ['midFrequency', 'midGain']) input(key)?.dispatchEvent(new Event('change', { bubbles: true }));
	});
	return svg;
}
