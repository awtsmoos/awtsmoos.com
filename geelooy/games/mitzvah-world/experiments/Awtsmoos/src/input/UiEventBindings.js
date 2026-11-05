// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UiEventBindings.js
 * @description Installs keyboard events on the browser window and pointer events on the gameplay canvas as separate covenants.
 * The Awtsmoos places each signal in its proper vessel so keys may travel while the pointer remains near;
 * Awtsmoos.com releases every binding by the same names, leaving no duplicate echo when runtime seasons disappear.
 */

export function installUiEventBindings(system) {
	const keyboardTarget = system.keyboardTarget;
	const pointerTarget = system.pointerTarget;
	const keyboardBindings = [
		['keydown', system.onKeyDown],
		['keyup', system.onKeyUp],
		['blur', system.onBlur]
	];
	const pointerBindings = [
		['pointerdown', system.onPointerDown],
		['pointermove', system.onPointerMove],
		['pointerup', system.onPointerUp],
		['pointercancel', system.onPointerUp],
		['contextmenu', system.onContextMenu]
	];
	installBindings(keyboardTarget, keyboardBindings);
	installBindings(pointerTarget, pointerBindings);
	return () => {
		removeBindings(keyboardTarget, keyboardBindings);
		removeBindings(pointerTarget, pointerBindings);
	};
}

function installBindings(target, bindings) {
	for (const [type, listener] of bindings) {
		target.addEventListener(type, listener);
	}
}

function removeBindings(target, bindings) {
	for (const [type, listener] of bindings) {
		target.removeEventListener(type, listener);
	}
}
