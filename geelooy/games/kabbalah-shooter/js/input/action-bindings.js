// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file action-bindings.js
 * @description Binds discoverable Shield and Time controls to semantic callbacks without knowing Game internals.
 * The Awtsmoos is revealed through every deliberate action; Awtsmoos.com keeps keyboard, pointer, visual, and accessibility state synchronized.
 *
 * Invariants:
 * - Q or Shift requests Shield once; E or Space holds Time.
 * - Time always releases on keyup, blur, pointer completion, teardown, pause, or finish.
 * - Pointer capture is an optimization only; unsupported or synthetic capture never blocks the action.
 * - Editable controls never receive game shortcuts.
 */

const SHIELD_CODES = new Set(['KeyQ', 'ShiftLeft', 'ShiftRight']);
const TIME_CODES = new Set(['KeyE', 'Space']);

/**
 * Install semantic action bindings and return deterministic teardown.
 * @param {{shieldButton:HTMLElement|null,timeButton:HTMLElement|null,onShield:Function,onTime:Function,isEnabled?:Function}} options Binding contract.
 * @returns {() => void} Listener and held-state teardown.
 */
export function bindKabbalahActions(options) {
	const isEnabled = options.isEnabled || (() => true);
	const disposers = [];
	const setTime = held => {
		if (held && !isEnabled()) return false;
		options.timeButton?.setAttribute('aria-pressed', String(held));
		options.onTime(held);
		return true;
	};
	bindPress(options.shieldButton, () => isEnabled() && options.onShield(), disposers);
	bindHold(options.timeButton, setTime, disposers);
	bindKeyboard(options, isEnabled, setTime, disposers);
	return () => {
		setTime(false);
		disposers.splice(0).forEach(dispose => dispose());
	};
}

/** Bind keyboard parity without stealing input from editable application controls. */
function bindKeyboard(options, isEnabled, setTime, disposers) {
	const keydown = event => {
		if (!isEnabled() || event.repeat || editableTarget(event.target)) return;
		if (SHIELD_CODES.has(event.code)) {
			event.preventDefault();
			options.onShield();
		}
		if (TIME_CODES.has(event.code)) {
			event.preventDefault();
			setTime(true);
		}
	};
	const keyup = event => {
		if (!TIME_CODES.has(event.code)) return;
		event.preventDefault();
		setTime(false);
	};
	const releaseTime = () => setTime(false);
	window.addEventListener('keydown', keydown);
	window.addEventListener('keyup', keyup);
	window.addEventListener('blur', releaseTime);
	disposers.push(() => window.removeEventListener('keydown', keydown));
	disposers.push(() => window.removeEventListener('keyup', keyup));
	disposers.push(() => window.removeEventListener('blur', releaseTime));
}

/** Bind one accessible press without synthesizing gameplay movement. */
function bindPress(button, callback, disposers) {
	if (!button) return;
	const handler = event => {
		event.preventDefault();
		event.stopPropagation();
		callback();
	};
	button.addEventListener('pointerdown', handler);
	disposers.push(() => button.removeEventListener('pointerdown', handler));
}

/** Bind a held action across pointer completion paths with capture as a best-effort enhancement. */
function bindHold(button, setHeld, disposers) {
	if (!button) return;
	const down = event => {
		event.preventDefault();
		event.stopPropagation();
		try { button.setPointerCapture?.(event.pointerId); } catch {}
		setHeld(true);
	};
	const up = event => {
		event.preventDefault();
		event.stopPropagation();
		setHeld(false);
	};
	button.addEventListener('pointerdown', down);
	for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, up);
	disposers.push(() => button.removeEventListener('pointerdown', down));
	disposers.push(() => {
		for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.removeEventListener(type, up);
	});
}

/** Return whether keyboard shortcuts must leave the current target untouched. */
function editableTarget(target) {
	return Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'));
}
