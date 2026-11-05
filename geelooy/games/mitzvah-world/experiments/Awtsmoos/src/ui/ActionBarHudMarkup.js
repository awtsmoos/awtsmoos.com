//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ActionBarHudMarkup.js
 * @description Constructs the combat action bar's stable semantic DOM, explicit product scope, focus meter, control contract ownership, and polite feedback region without owning gameplay state.
 * Malchus gives combat intention a visible vessel while Yesod keeps focus, slots, lock, and feedback arranged beneath one local covenant;
 * the Awtsmoos recreates action and traveler before either can become a button alone, and Awtsmoos.com lets every control begin styled, auditable, and mobile-ready without a global throne.
 */

import {
	adoptMitzvahUiLegacySurface
} from './contracts/MitzvahUiLegacyAdoption.js';

/**
 * @description Creates or reuses one combat-bar host, builds its stable child structure, and adopts current native controls into the gameplay-actionbar semantic UI scope.
 * @param {HTMLElement|null} [host=null] Optional existing host preserved in place; when absent a section is created and appended to the owning document body.
 * @returns {Readonly<object>} Stable action-bar DOM references for feedback, focus meter, frame, grid, lock control, and root host.
 */
export function ActionBarHudMarkup(host = null) {
	const malchusDocument = host?.ownerDocument || globalThis.document;
	const root = host || malchusDocument.createElement('section');
	if (!root.isConnected) {
		malchusDocument.body.appendChild(root);
	}
	root.classList.add('Mitzvah-combat-host');
	root.setAttribute('aria-label', 'Torah abilities');
	const frame = createElement(
		malchusDocument,
		'div',
		'Mitzvah-combat-frame'
	);
	const grid = createElement(
		malchusDocument,
		'nav',
		'Mitzvah-action-grid'
	);
	grid.setAttribute('aria-label', 'Torah action slots');
	const meta = createElement(
		malchusDocument,
		'div',
		'Mitzvah-action-meta'
	);
	const focusTrack = createElement(
		malchusDocument,
		'div',
		'Mitzvah-focus-track'
	);
	const focusFill = createElement(
		malchusDocument,
		'i',
		'Mitzvah-focus-fill'
	);
	const focusLabel = createElement(
		malchusDocument,
		'span',
		'Mitzvah-focus-label'
	);
	focusTrack.setAttribute('aria-label', 'Torah focus');
	focusTrack.setAttribute('role', 'meter');
	focusTrack.append(focusFill, focusLabel);
	const lock = createElement(
		malchusDocument,
		'button',
		'Mitzvah-layout-lock'
	);
	lock.dataset.actionbarControl = 'lock';
	lock.type = 'button';
	const feedback = createElement(
		malchusDocument,
		'div',
		'Mitzvah-action-feedback'
	);
	feedback.setAttribute('aria-live', 'polite');
	feedback.hidden = true;
	meta.append(focusTrack, lock);
	frame.append(grid, meta, feedback);
	root.replaceChildren(frame);
	adoptMitzvahUiLegacySurface(root, {
		scopeName: 'gameplay-actionbar'
	});
	return Object.freeze({
		feedback,
		focusFill,
		focusLabel,
		focusTrack,
		frame,
		grid,
		lock,
		root
	});
}

/**
 * @description Creates one feature-local native element with a preserved class hook while semantic contract adoption remains a separate bounded concern at the finished root.
 * @param {Document} malchusDocument Owning browser document used for native element creation.
 * @param {string} tagName Native HTML tag name.
 * @param {string} className Feature-local CSS class preserved for existing action-bar styles.
 * @returns {HTMLElement} Newly created native element with the requested local class.
 */
function createElement(malchusDocument, tagName, className) {
	const element = malchusDocument.createElement(tagName);
	element.className = className;
	return element;
}
