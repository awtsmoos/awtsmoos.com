// B"H
// Boruch Hashem
// Blessed is He
/** @module HebrewWordActions @description One delegated listener honors click, keyboard, and long press without blocking scroll. */
import { showCustomContextMenu } from '../../functions/ui/contextMenu.js';
import { tokenRange } from '../../functions/ui/context/hebrewToken.js';

export function setupHebrewWordActions() {
	const root = document.getElementById('realPost');
	if (!root || root.dataset.tanachActionsBound) return;
	root.dataset.tanachActionsBound = 'true';
	let timer = null;
	let origin = null;
	root.addEventListener('pointerdown', event => {
		if (event.pointerType !== 'touch') return;
		origin = { x: event.clientX, y: event.clientY, event };
		timer = setTimeout(() => showCustomContextMenu(origin.x, origin.y, origin.event), 550);
	}, { passive: true });
	root.addEventListener('pointermove', event => {
		if (!origin || Math.hypot(event.clientX - origin.x, event.clientY - origin.y) < 12) return;
		clearTimeout(timer);
		origin = null;
	}, { passive: true });
	root.addEventListener('pointerup', () => { clearTimeout(timer); origin = null; }, { passive: true });
	root.addEventListener('click', event => {
		if (event.detail !== 1 || event.target.closest('a,button,input,textarea,select')) return;
		if (!tokenRange(event.clientX, event.clientY)) return;
		showCustomContextMenu(event.clientX, event.clientY, event);
	});
	root.addEventListener('keydown', event => {
		if ((event.key !== 'Enter' && event.key !== ' ') || !event.target.closest('[data-awtsmoos-text-id],.section,.sub-awtsmoos')) return;
		const rectangle = event.target.getBoundingClientRect();
		showCustomContextMenu(rectangle.left + 8, rectangle.top + 8, event);
	});
}
