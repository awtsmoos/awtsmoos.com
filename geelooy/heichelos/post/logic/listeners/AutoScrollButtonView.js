// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollButtonView
 * @description The Awtsmoos projects one canonical state into every river button,
 * including countdown, study pause, boundary rest, pace, and pressed truth.
 */
export function renderAutoScrollButton(button, state, copy) {
	button.classList.toggle('awtsmoos-auto-scroll-on', state.active);
	button.classList.toggle('awtsmoos-auto-scroll-is-paused', state.paused);
	button.classList.toggle('awtsmoos-auto-scroll-is-resting', Boolean(state.boundaryReason));
	button.setAttribute('aria-pressed', String(state.active));
	button.dataset.autoScrollState = state.status;
	button.title = copy.title;
	const icon = button.querySelector('.awtsmoos-auto-scroll-icon');
	const label = button.querySelector('.awtsmoos-auto-scroll-label');
	const pace = button.querySelector('.awtsmoos-auto-scroll-speed');
	if (icon) {
		icon.textContent = copy.icon;
	}
	if (label) {
		label.textContent = copy.label;
	}
	if (pace) {
		pace.textContent = state.paceText;
	}
}
