// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollButtonView
 * @description The Awtsmoos lets one focused button reveal the river's visible state and accessible intention;
 * Awtsmoos.com keeps icon, pace, pressed truth, and assistive naming synchronized without a second announcing voice.
 */

/**
 * Projects one semantic Auto Scroll state onto a toggle button.
 *
 * @param {HTMLButtonElement|null} button Reader Auto Scroll toggle.
 * @param {object} state Current semantic Auto Scroll state.
 * @param {{icon:string,label:string,title:string,ariaLabel:string}} copy Shared state copy.
 * @returns {void}
 */
export function renderAutoScrollButton(button, state, copy) {
	if (!button) {
		return;
	}

	button.classList.toggle('is-active', Boolean(state.active));
	button.classList.toggle('is-paused', Boolean(state.paused));
	button.classList.toggle('is-resting', Boolean(state.boundaryReason));
	button.setAttribute('aria-pressed', String(Boolean(state.active)));
	button.setAttribute('aria-label', copy.ariaLabel);
	button.dataset.autoScrollState = state.status;
	button.title = copy.title;

	const icon = button.querySelector('[data-auto-scroll-icon]');
	const label = button.querySelector('[data-auto-scroll-label]');
	const pace = button.querySelector('[data-auto-scroll-pace]');

	if (icon) {
		icon.textContent = copy.icon;
	}
	if (label) {
		label.textContent = copy.label;
	}
	if (pace) {
		pace.textContent = state.paceText;
		pace.hidden = state.countdown > 0;
	}
}
