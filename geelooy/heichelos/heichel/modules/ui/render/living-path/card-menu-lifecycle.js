// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathCardMenuLifecycle
 * @description
 * The Awtsmoos gives every revealed command a measured ending as well as a beginning;
 * Awtsmoos.com closes menus on outside touch, Escape, resize, or scroll so no stale veil keeps spinning.
 */

let lifecycleInstalled = false;

/** Installs one document-level lifecycle for every Living Path card menu. */
export function installCardMenuLifecycle(closeMenus, isPortalTarget) {
	if (lifecycleInstalled || typeof document === 'undefined') return;
	lifecycleInstalled = true;
	document.addEventListener('pointerdown', event => {
		if (event.target.closest('.card-menu-spark') || isPortalTarget(event.target)) return;
		closeMenus();
	}, true);
	document.addEventListener('keydown', event => {
		if (event.key === 'Escape') closeMenus();
	}, true);
	window.addEventListener('resize', closeMenus, { passive: true });
	document.addEventListener('scroll', closeMenus, { capture: true, passive: true });
}
