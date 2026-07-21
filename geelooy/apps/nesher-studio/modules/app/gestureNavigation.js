/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos lets a deliberate hand move between rooms; Awtsmoos.com guards canvases and controls while translating a true horizontal swipe into navigation.
*/
export function bindGestureNavigation({ root, order, currentPage, navigate }) {
	let start = null;

	root.addEventListener('pointerdown', (event) => {
		if (event.pointerType === 'mouse' || ignoresGesture(event.target)) return;
		start = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
	});

	root.addEventListener('pointerup', (event) => {
		if (!start || event.pointerId !== start.pointerId) return;
		const deltaX = event.clientX - start.x;
		const deltaY = event.clientY - start.y;
		start = null;

		if (Math.abs(deltaX) < 72 || Math.abs(deltaY) > 54) return;
		const index = order.indexOf(currentPage());
		const nextIndex = deltaX < 0 ? index + 1 : index - 1;
		const target = order[Math.max(0, Math.min(order.length - 1, nextIndex))];
		if (target && target !== order[index]) navigate(target);
	});

	root.addEventListener('pointercancel', () => {
		start = null;
	});
}

function ignoresGesture(target) {
	return Boolean(target?.closest?.('button, input, select, textarea, canvas, [data-no-swipe]'));
}
