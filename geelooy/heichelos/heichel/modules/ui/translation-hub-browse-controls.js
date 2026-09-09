// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubBrowseControls
 * @description
 * The Awtsmoos turns native alphabet and sparse-anchor testimony into touch-sized choices without mixing network state into DOM craft;
 * Awtsmoos.com keeps Hebrew and Yiddish letters prominent, while every button remains keyboard-visible and truthfully selected.
 */

import { element } from './translation-hub-shared.js';

const HEBREW_LETTER = /[א-תװ-ײ]/;

/** Returns learner-facing Hebrew/Yiddish letter entries before any unusual source punctuation or Latin shards. */
export function primaryLetters(letters = []) {
	const values = Array.isArray(letters) ? letters.filter(item => item?.letter) : [];
	const primary = values.filter(item => HEBREW_LETTER.test(item.letter));
	return primary.length ? primary : values;
}

/** Creates one selectable browse chip with pressed-state semantics. */
function choiceButton(text, selected, className, onChoose) {
	const button = element('button', className, text);
	button.type = 'button';
	button.setAttribute('aria-pressed', String(Boolean(selected)));
	if (selected) button.dataset.active = 'true';
	button.addEventListener('click', onChoose);
	return button;
}

/** Replaces the alphabet strip with native letters and truthful entry counts. */
export function renderAlphabet(area, letters, activeToken, onChoose) {
	area.replaceChildren();
	for (const letter of primaryLetters(letters)) {
		const label = `${letter.letter} ${Number(letter.count) || 0}`;
		area.appendChild(choiceButton(label, letter.token === activeToken, 'dictionary-letter', () => onChoose(letter)));
	}
}

/** Replaces the sparse-range strip with lexical starting points for one selected letter. */
export function renderRanges(area, ranges, activeStart, onChoose) {
	area.replaceChildren();
	const values = Array.isArray(ranges) ? ranges : [];
	if (!values.length) {
		area.appendChild(element('p', 'lexicon-state', 'אין טווחים נוספים · No additional ranges'));
		return;
	}
	for (const range of values) {
		const label = String(range.label || range.start || '…');
		area.appendChild(choiceButton(label, range.start === activeStart, 'dictionary-range', () => onChoose(range)));
	}
}
