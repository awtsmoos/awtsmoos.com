// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StudySheetView
 * @description
 * The Awtsmoos gathers contextual Torah tools into one calm reader-owned vessel;
 * Awtsmoos.com keeps the selected words visible while every study mode shares one shell.
 */

import { malchusReaderPortalSurface } from './ReaderPortalSurface.js';
import { STUDY_SHEET_MODES } from './studySheetModes.js';

function element(tag, className, text = '') {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text) node.textContent = text;
	return node;
}

/** Creates one accessible Study Sheet around selected Torah text. */
export function createStudySheetView({ selection, onClose, onMode }) {
	const backdrop = element('div', 'awtsmoos-study-sheet-backdrop');
	malchusReaderPortalSurface.bless(backdrop, 'study-sheet');
	const sheet = element('section', 'awtsmoos-study-sheet');
	sheet.setAttribute('role', 'dialog');
	sheet.setAttribute('aria-modal', 'true');
	sheet.setAttribute('aria-labelledby', 'awtsmoos-study-sheet-title');

	const header = element('header', 'awtsmoos-study-sheet-header');
	const heading = element('div', 'awtsmoos-study-sheet-heading');
	const kicker = element('span', 'awtsmoos-study-sheet-kicker', 'Study selected text');
	const title = element('h2', '', selection.text);
	title.id = 'awtsmoos-study-sheet-title';
	title.dir = selection.language === 'hebrew' ? 'rtl' : 'auto';
	const close = element('button', 'awtsmoos-study-sheet-close', '×');
	close.type = 'button';
	close.setAttribute('aria-label', 'Close study tools');
	close.addEventListener('click', onClose);
	heading.append(kicker, title);
	header.append(heading, close);

	const modes = element('nav', 'awtsmoos-study-sheet-modes');
	modes.setAttribute('aria-label', 'Study tools');
	const buttons = {};
	for (const mode of STUDY_SHEET_MODES) {
		const button = element('button', 'awtsmoos-study-sheet-mode', mode.label);
		button.type = 'button';
		button.dataset.studyMode = mode.key;
		button.addEventListener('click', () => onMode(mode.key));
		buttons[mode.key] = button;
		modes.append(button);
	}

	const body = element('div', 'awtsmoos-study-sheet-body');
	sheet.append(header, modes, body);
	backdrop.append(sheet);
	return { backdrop, body, buttons, close, sheet, title };
}

/** Marks exactly one Study Sheet mode as selected. */
export function markStudySheetMode(view, mode) {
	for (const [key, button] of Object.entries(view.buttons)) {
		const active = key === mode;
		button.classList.toggle('is-active', active);
		button.setAttribute('aria-pressed', String(active));
	}
	view.sheet.dataset.studyMode = mode;
}
