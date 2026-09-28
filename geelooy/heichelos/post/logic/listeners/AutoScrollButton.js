// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollButton
 * @description
 * The Awtsmoos lets one touch release one continuous river. Awtsmoos.com keeps
 * both reader buttons inside the same state renderer: Start moves now; Stop rests.
 */
import {
	initializeAutoScrollDownState,
	toggleAutoScrollDown
} from '../../actions/AutoScrollDown.js';
import {
	connectAutoScrollControlView,
	renderAutoScrollControls
} from './AutoScrollControlView.js';

const BUTTON_ID = 'awtsmoosAutoScrollBtn';

function bind(button) {
	if (!button || button.dataset.autoScrollBound === 'true') {
		return button;
	}
	button.dataset.autoScrollBound = 'true';
	button.dataset.autoScrollControl = 'true';
	button.dataset.autoScrollToggle = 'true';
	button.addEventListener('click', () => {
		toggleAutoScrollDown();
		renderAutoScrollControls();
	});
	return button;
}

export function ensureAutoScrollButton() {
	initializeAutoScrollDownState();
	connectAutoScrollControlView();
	const existing = document.getElementById(BUTTON_ID);
	if (existing) {
		bind(existing);
		renderAutoScrollControls();
		return existing;
	}
	const button = document.createElement('button');
	button.id = BUTTON_ID;
	button.type = 'button';
	button.className = 'awtsmoos-auto-scroll-floating';
	button.setAttribute('aria-live', 'polite');
	button.innerHTML = [
		'<span class="awtsmoos-auto-scroll-icon" data-auto-scroll-icon aria-hidden="true">↓</span>',
		'<span class="awtsmoos-auto-scroll-label" data-auto-scroll-label>Start</span>',
		'<span class="awtsmoos-auto-scroll-speed" data-auto-scroll-pace></span>'
	].join('');
	document.body.append(button);
	bind(button);
	renderAutoScrollControls();
	return button;
}
