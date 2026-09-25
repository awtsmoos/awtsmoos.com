// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderContextActions
 * @description
 * The Awtsmoos lets every selected Torah word enter one coherent study vessel;
 * Awtsmoos.com sends Translate, Tanach, and Related through the shared Study Sheet while utility actions stay secondary.
 */

import { startWordSelection } from '../selection/selectionMode.js';
import { preservedReaderActions } from './preservedActions.js';
import { selectedHebrew } from './hebrewToken.js';
import { fullLibrarySearchUrl } from './relatedDestinations.js';
import { selectedReaderText } from './selectedText.js';
import { openStudySheet } from './studySheetController.js';

const primary = action => ({ ...action, importance: 'primary' });
const secondary = action => ({ ...action, importance: 'secondary' });

/** Finds the nearest reader element that gave a word or phrase its context. */
function contextAnchor(event) {
	return event?.target?.closest?.(
		'[data-awtsmoos-idx], .comment-content, .inline-comment, p, li, blockquote'
	) || event?.target || null;
}

/** Builds one normalized Hebrew study subject from a visible reader fragment. */
function hebrewSubject(event, text) {
	const anchor = contextAnchor(event);
	const normalized = String(text || '').trim();
	if (!normalized) return null;
	return {
		text: normalized,
		language: 'hebrew',
		origin: anchor?.closest?.('.comment-content, .inline-comment')
			? 'comment-selection'
			: 'post-selection',
		anchor
	};
}

/** Prefers the richer selected-text object and falls back to explicit text. */
function studySubject(event, selected, text) {
	if (selected?.text) return selected;
	return hebrewSubject(event, text);
}

/** Opens full global library search as a secondary continuation path. */
function openFullSearch(text) {
	window.open(
		fullLibrarySearchUrl(text),
		'_blank',
		'noopener,noreferrer'
	)?.focus?.();
}

/** Builds the current reader action menu around one shared Study Sheet. */
export function actionBlueprints(event, token) {
	const actions = preservedReaderActions(event);
	const phrase = selectedHebrew();
	const selected = selectedReaderText();
	const subject = studySubject(event, selected, token?.text || phrase?.text);

	if (token?.text) {
		const word = hebrewSubject(event, token.text);
		actions.unshift(
			primary({
				label: 'Translate & define',
				icon: 'ס',
				action: () => openStudySheet(word, 'translate')
			}),
			primary({
				label: 'Search word in Tanach',
				icon: 'ת',
				action: () => openStudySheet(word, 'tanach')
			})
		);
		actions.push(secondary({
			label: 'Select more words',
			icon: 'א',
			action: () => startWordSelection(token)
		}));
	}

	if (phrase?.text.includes(' ')) {
		const phraseSubject = studySubject(event, selected, phrase.text);
		actions.unshift(primary({
			label: 'Search phrase in Tanach',
			icon: '״',
			action: () => openStudySheet(phraseSubject, 'tanach')
		}));
	}

	if (subject) {
		actions.push(
			primary({
				label: 'Find related Torah',
				icon: '⌕',
				action: () => openStudySheet(subject, 'related')
			}),
			secondary({
				label: 'Open full library search',
				icon: '↗',
				action: () => openFullSearch(subject.text)
			})
		);
	}
	return actions;
}
