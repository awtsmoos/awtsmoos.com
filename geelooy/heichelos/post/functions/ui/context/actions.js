// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderContextActions
 * @description
 * The Awtsmoos lets a touched word or deliberate browser selection open both exact Tanach and whole-library pathways;
 * Awtsmoos.com preserves every older reader deed while adding related sources here and a full search in a new tab.
 */

import { startWordSelection } from '../selection/selectionMode.js';
import { preservedReaderActions } from './preservedActions.js';
import { selectedHebrew } from './hebrewToken.js';
import { fullLibrarySearchUrl } from './relatedDestinations.js';
import { showRelatedSearch } from './relatedSearchPanel.js';
import { selectedReaderText } from './selectedText.js';
import { showTanachResults } from './tanachPanel.js';

function tokenSubject(event, token) {
	if (!token?.text) return null;
	const anchor = event?.target?.closest?.(
		'[data-awtsmoos-idx], .comment-content, .inline-comment, p, li, blockquote'
	) || event?.target || null;
	const comment = Boolean(anchor?.closest?.('.comment-content, .inline-comment'));
	return {
		text: token.text,
		language: 'hebrew',
		origin: comment ? 'comment-selection' : 'post-selection',
		anchor
	};
}

function openFullSearch(text) {
	window.open(fullLibrarySearchUrl(text), '_blank', 'noopener,noreferrer');
}

export function actionBlueprints(event, token) {
	const actions = preservedReaderActions(event);
	const phrase = selectedHebrew();
	const selected = selectedReaderText();
	const subject = selected || tokenSubject(event, token);

	if (token) {
		actions.push(
			{
				label: 'Select words',
				icon: 'א',
				action: () => startWordSelection(token)
			},
			{
				label: 'Search this word in Tanach',
				icon: 'ת',
				action: () => showTanachResults(token.text)
			}
		);
	}

	if (phrase?.text.includes(' ')) {
		actions.push({
			label: 'Search selected Hebrew phrase in Tanach',
			icon: '״',
			action: () => showTanachResults(phrase.text)
		});
	}

	if (subject) {
		actions.push(
			{
				label: 'Find related sources',
				icon: '⌕',
				action: () => showRelatedSearch(subject)
			},
			{
				label: 'Open full library search',
				icon: '↗',
				action: () => openFullSearch(subject.text)
			}
		);
	}
	return actions;
}
