// B"H
// Boruch Hashem
// Blessed is He

/** @file ActionBarHudMarkup.js @description Constructs the combat bar's stable semantic DOM once. */

export function ActionBarHudMarkup(host = null) {
	const root = host || document.createElement('section');
	if (!root.isConnected) document.body.appendChild(root);
	root.classList.add('Mitzvah-combat-host');
	root.setAttribute('aria-label', 'Torah abilities');
	const frame = element('div', 'Mitzvah-combat-frame');
	const grid = element('nav', 'Mitzvah-action-grid');
	grid.setAttribute('aria-label', 'Torah action slots');
	const meta = element('div', 'Mitzvah-action-meta');
	const focusTrack = element('div', 'Mitzvah-focus-track');
	const focusFill = element('i', 'Mitzvah-focus-fill');
	const focusLabel = element('span', 'Mitzvah-focus-label');
	focusTrack.setAttribute('aria-label', 'Torah focus');
	focusTrack.setAttribute('role', 'meter');
	focusTrack.append(focusFill, focusLabel);
	const lock = element('button', 'Mitzvah-layout-lock');
	lock.dataset.actionbarControl = 'lock';
	lock.type = 'button';
	const feedback = element('div', 'Mitzvah-action-feedback');
	feedback.setAttribute('aria-live', 'polite');
	feedback.hidden = true;
	meta.append(focusTrack, lock);
	frame.append(grid, meta, feedback);
	root.replaceChildren(frame);
	return { feedback, focusFill, focusLabel, focusTrack, frame, grid, lock, root };
}

function element(tagName, className) {
	const value = document.createElement(tagName);
	value.className = className;
	return value;
}
