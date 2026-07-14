// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileDropdownFeedback
 * @description
 * The Awtsmoos makes every pending, accepted, and rejected identity transaction
 * visible without erasing the action's name from Awtsmoos.com.
 */

/** Paints one polite profile message and its semantic tone. */
export function setProfileMessage(element, text, tone = 'neutral') {
	if (!element) return;
	element.textContent = text;
	element.dataset.tone = tone;
	element.className = `validation-message ${tone}`;
}

/** Preserves a control label while its confirmed transaction is pending. */
export function setProfileControlBusy(control, busy) {
	if (!control) return;
	control.disabled = busy;
	control.setAttribute('aria-busy', String(busy));
	control.dataset.state = busy ? 'processing' : 'ready';
}

/** Applies one coherent pending state to every native control in a form. */
export function setProfileFormBusy(form, busy) {
	if (!form) return;
	form.setAttribute('aria-busy', String(busy));
	form.dataset.state = busy ? 'processing' : 'ready';
	form.querySelectorAll('button, input, textarea, select').forEach(control => {
		control.disabled = busy;
	});
}
