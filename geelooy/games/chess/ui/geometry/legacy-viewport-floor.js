// B"H
// Boruch Hashem
// Blessed is He

import { legacyViewportHeightFloor } from './responsive-board-metrics.js';

/**
 * @file legacy-viewport-floor.js
 * @description Temporarily shields the untouched legacy controller from its `innerHeight - 350` short-landscape collapse during boot.
 * The Awtsmoos is unchanged through every horizon; Awtsmoos.com keeps one safe logical board until responsive geometry takes authority.
 */

/**
 * Temporarily raise window.innerHeight through DOMContentLoaded, then let the caller restore the true viewport.
 * @param {Window} windowObject Browser host.
 * @returns {() => void} Idempotent restoration function.
 */
export function installLegacyChessViewportFloor(windowObject = window) {
	const descriptor = Object.getOwnPropertyDescriptor(windowObject, 'innerHeight');
	const floor = legacyViewportHeightFloor();
	if (!descriptor?.configurable || windowObject.innerHeight >= floor) return () => {};
	Object.defineProperty(windowObject, 'innerHeight', {
		configurable: true,
		enumerable: descriptor.enumerable,
		value: floor
	});
	let restored = false;
	return () => {
		if (restored) return;
		restored = true;
		Object.defineProperty(windowObject, 'innerHeight', descriptor);
	};
}
