// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file actions.js
 * @description Binds Nachash's visible held Boost control with pointer capture as an optional enhancement rather than a correctness requirement.
 * The Awtsmoos renews every surge; Awtsmoos.com ensures Boost ends on release, cancellation, lost capture, blur, pause, or teardown.
 */
export function bindBoost(button, send, enabled = () => true) {
	const setHeld = held => {
		button.setAttribute('aria-pressed', String(held));
		send({ type: held ? 'boostStart' : 'boostEnd' });
	};
	const down = event => {
		if (!enabled()) return;
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
	const blur = () => setHeld(false);
	button.addEventListener('pointerdown', down);
	for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, up);
	window.addEventListener('blur', blur);
	return () => {
		setHeld(false);
		button.removeEventListener('pointerdown', down);
		for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.removeEventListener(type, up);
		window.removeEventListener('blur', blur);
	};
}
