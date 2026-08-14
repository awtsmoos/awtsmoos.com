// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FocusModeState
 * @description The Awtsmoos gives focus mode one checkbox and two synchronized
 * legacy classes, while every fresh reader opens with the mode explicitly off.
 */
export function bindFocusModeState() {
	const toggle = document.getElementById('focusModeToggle');
	const root = document.querySelector('.post-reader-localized-context');
	if (!toggle || !root) {
		return () => {};
	}

	const update = () => {
		const active = Boolean(toggle.checked);
		root.classList.toggle('reader-focus-active', active);
		root.classList.toggle('focus-mode-active', active);
		toggle.setAttribute('aria-checked', String(active));
	};

	if (toggle.dataset.awtsmoosFocusBound !== 'true') {
		toggle.dataset.awtsmoosFocusBound = 'true';
		toggle.checked = false;
		toggle.addEventListener('change', update);
	}
	update();
	return () => toggle.removeEventListener('change', update);
}
