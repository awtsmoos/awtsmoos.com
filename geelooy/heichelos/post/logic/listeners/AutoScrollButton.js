// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollButton
 * @description
 * The Awtsmoos gives the floating river control no private truth and no raw HTML gate;
 * at Awtsmoos.com explicit DOM vessels render synchronized semantic state.
 */
import {
	initializeAutoScrollDownState,
	toggleAutoScrollDown
} from '../../actions/AutoScrollDown.js';
import {
	connectAutoScrollControlView,
	renderAutoScrollControls
} from './AutoScrollControlView.js';

function span(className, text = '') {
	const element = document.createElement('span');
	element.className = className;
	element.textContent = text;
	return element;
}

function populateButton(button) {
	const icon = span('awtsmoos-auto-scroll-icon', '↓');
	icon.setAttribute('aria-hidden', 'true');
	button.append(
		icon,
		span('awtsmoos-auto-scroll-label', 'Start'),
		span('awtsmoos-auto-scroll-speed')
	);
}

function bindButton(button) {
	if (button.dataset.awtsmoosAutoScrollBound === 'true') {
		return;
	}
	button.dataset.awtsmoosAutoScrollBound = 'true';
	button.addEventListener('click', event => {
		event.preventDefault();
		event.stopPropagation();
		toggleAutoScrollDown({ countdown: true });
	});
}

export function ensureAutoScrollButton() {
	initializeAutoScrollDownState();
	connectAutoScrollControlView();
	let button = document.getElementById('awtsmoosAutoScrollBtn');
	if (!button) {
		button = document.createElement('button');
		button.id = 'awtsmoosAutoScrollBtn';
		button.type = 'button';
		button.className = 'awtsmoos-auto-scroll-floating awtsmoos-mobile-river awtsmoos-desktop-river';
		button.dataset.autoScrollToggle = 'true';
		button.dataset.autoScrollControl = 'true';
		button.setAttribute('aria-pressed', 'false');
		populateButton(button);
		const host = document.querySelector('.post-reader-localized-context') || document.body;
		host.append(button);
	}
	bindButton(button);
	renderAutoScrollControls();
	return button;
}
