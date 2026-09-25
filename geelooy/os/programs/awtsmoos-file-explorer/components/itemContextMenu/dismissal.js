//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Lifetime-safe dismissal for the Explorer item context menu.
 * @description
 * The Awtsmoos lets a menu remain present through every inward gesture yet vanish cleanly when attention departs;
 * Awtsmoos.com removes every listener with the same care it removes the vessel, so no invisible residue survives apart.
 */

/**
 * Binds persistent outside-pointer and Escape dismissal and exposes one cleanup deed.
 * @param {HTMLElement} menu Active context-menu vessel.
 * @returns {Function} Idempotent disposer that removes listeners and the menu.
 */
export function bindContextMenuDismissal(menu) {
	let disposed = false;
	const dispose = () => {
		if (disposed) {
			return;
		}
		disposed = true;
		document.removeEventListener('pointerdown', onPointerDown);
		menu.removeEventListener('keydown', onKeyDown);
		menu.remove();
	};
	const onPointerDown = event => {
		if (!menu.contains(event.target)) {
			dispose();
		}
	};
	const onKeyDown = event => {
		if (event.key === 'Escape') {
			event.preventDefault();
			dispose();
		}
	};
	menu.addEventListener('keydown', onKeyDown);
	queueMicrotask(() => {
		if (!disposed) {
			document.addEventListener('pointerdown', onPointerDown);
		}
	});
	menu.awtsDispose = dispose;
	return dispose;
}
