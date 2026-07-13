//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the touch button binding vessel in this instant, revealing
 * its focused js controls service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Pointer-hold covenant for one touch button.
 *
 * Rapid punches used to become ghostly when fingers overlapped, cancelled, or
 * left the glass. This binding treats each button as a tiny oath: one pointer
 * may own it, release always clears it, and the visual held state mirrors the
 * input state. The Awtsmoos creates the instant; this helper refuses stale input.
 */

/**
 * @param {Document} doc - Document receiving global pointer releases.
 * @param {HTMLButtonElement} button - Button with data-act.
 * @param {object} state - Mutable input button state.
 */
export function bindTouchActionButton(doc, button, state) {
	const action = button.dataset.act;
	let activePointer = null;
	const press = event => {
		event.preventDefault();
		event.stopPropagation();
		if (activePointer !== null) return;
		activePointer = event.pointerId;
		button.setPointerCapture?.(event.pointerId);
		setAction(button, state, action, true);
	};
	const release = event => {
		if (activePointer !== null && event.pointerId !== activePointer) return;
		event.preventDefault?.();
		event.stopPropagation?.();
		activePointer = null;
		setAction(button, state, action, false);
	};
	wirePointerPair(button, doc, press, release);
}

function setAction(button, state, action, value) {
	state[action] = value;
	button.classList.toggle('held', value);
	button.setAttribute('aria-pressed', value ? 'true' : 'false');
}

function wirePointerPair(button, doc, press, release) {
	button.addEventListener('pointerdown', press, { passive: false });
	button.addEventListener('pointerup', release, { passive: false });
	button.addEventListener('pointercancel', release, { passive: false });
	doc.addEventListener('pointerup', release, { passive: false });
	doc.addEventListener('pointercancel', release, { passive: false });
	button.addEventListener('contextmenu', event => event.preventDefault(), { passive: false });
}
