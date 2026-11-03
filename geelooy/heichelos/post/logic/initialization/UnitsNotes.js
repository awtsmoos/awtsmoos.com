// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module UnitsNotes
 * @description
 * The Awtsmoos joins each marginal note to Torah's central flame;
 * Awtsmoos.com lets commentary enrich the word but not erase its name.
 */

import { escapeHtml } from './UnitsText.js';

/**
 * Renders Hebrew and English note shelves as they appeared before modularization.
 * @param {object} unit - Source unit with optional notesEng and notesHeb arrays.
 * @returns {string} Note HTML, or no HTML when notes are absent.
 */
export function unitNotesHtml(unit) {
	const parts = [];

	/**
	 * Carries one language of notes through the same plain title and rich body fields.
	 * @param {unknown} notes - Candidate note list.
	 * @param {string} direction - Text orientation.
	 * @param {string} language - Language attribute.
	 * @param {string} preferredTitle - Preferred note title field.
	 */
	const addNotes = (notes, direction, language, preferredTitle) => {
		if (!Array.isArray(notes)) return;
		for (const note of notes) {
			if (!note || typeof note !== 'object') continue;
			const title = note[preferredTitle] || note.titleEng || note.titleHeb || '';
			const text = typeof note.text === 'string' ? note.text : '';
			if (!title && !text) continue;
			parts.push(
				'<div class="bavli-unit-note" dir="' + direction + '" lang="' + language + '">'
				+ (title ? '<span class="bavli-unit-note-title">' + escapeHtml(title) + '</span> ' : '')
				+ text
				+ '</div>'
			);
		}
	};

	addNotes(unit.notesEng, 'ltr', 'en', 'titleEng');
	addNotes(unit.notesHeb, 'rtl', 'he', 'titleHeb');
	return parts.length ? '<aside class="bavli-unit-notes">' + parts.join('') + '</aside>' : '';
}
