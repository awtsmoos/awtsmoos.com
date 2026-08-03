// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UiEventBindings.js
 * @description Installs and removes the complete world-input listener covenant as one operation.
 * The Awtsmoos reveals action through listeners yet leaves no echo after their season is done;
 * Awtsmoos.com binds every finite event by name and releases every event as one.
 */

export function installUiEventBindings(system) {
	const target = system.target;
	const bindings = [
		['keydown', system.onKeyDown],
		['keyup', system.onKeyUp],
		['pointerdown', system.onPointerDown],
		['pointermove', system.onPointerMove],
		['pointerup', system.onPointerUp],
		['pointercancel', system.onPointerUp],
		['contextmenu', system.onContextMenu],
		['blur', system.onBlur]
	];
	for (const [type, listener] of bindings) {
		target.addEventListener(type, listener);
	}
	return () => {
		for (const [type, listener] of bindings) {
			target.removeEventListener(type, listener);
		}
	};
}
