// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderContextActions
 * @description
 * The Awtsmoos lets the learner's immediate next deed appear first while utility actions wait behind a quieter second layer;
 * Awtsmoos.com makes Hebrew word definition, Tanach search, and related Torah direct instead of burying study beneath generic reader controls.
 */

import { startWordSelection } from '../selection/selectionMode.js';
import { preservedReaderActions } from './preservedActions.js';
import { selectedHebrew } from './hebrewToken.js';
import { fullLibrarySearchUrl } from './relatedDestinations.js';
import { showRelatedSearch } from './relatedSearchPanel.js';
import { selectedReaderText } from './selectedText.js';
import { showTanachResults } from './tanachPanel.js';

const primary = action => ({ ...action, importance: 'primary' });
const secondary = action => ({ ...action, importance: 'secondary' });

function tokenSubject(event, token) {
	if (!token?.text) return null;
	const anchor = event?.target?.closest?.(
		'[data-awtsmoos-idx], .comment-content, .inline-comment, p, li, blockquote'
	) || event?.target || null;
	return {
		text: token.text,
		language: 'hebrew',
		origin: anchor?.closest?.('.comment-content, .inline-comment')
			? 'comment-selection'
			: 'post-selection',
		anchor
	};
}

function openLanguageTools(text) {
	const url = new URL('/heichelos/ikar/series/torah-language-tools', window.location.origin);
	url.searchParams.set('lookup', text);
	window.open(`${url.pathname}${url.search}`, '_blank', 'noopener,noreferrer')?.focus?.();
}

function openFullSearch(text) {
	window.open(fullLibrarySearchUrl(text), '_blank', 'noopener,noreferrer')?.focus?.();
}

export function actionBlueprints(event, token) {
	const actions = preservedReaderActions(event);
	const phrase = selectedHebrew();
	const selected = selectedReaderText();
	const subject = selected || tokenSubject(event, token);

	if (token) {
		actions.unshift(
			primary({ label: 'Define this word', icon: 'ס', action: () => openLanguageTools(token.text) }),
			primary({ label: 'Search this word in Tanach', icon: 'ת', action: () => showTanachResults(token.text) })
		);
		actions.push(secondary({ label: 'Select more words', icon: 'א', action: () => startWordSelection(token) }));
	}
	if (phrase?.text.includes(' ')) {
		actions.unshift(primary({
			label: 'Search selected phrase in Tanach', icon: '״', action: () => showTanachResults(phrase.text)
		}));
	}
	if (subject) {
		actions.push(
			primary({ label: 'Find related sources', icon: '⌕', action: () => showRelatedSearch(subject) }),
			secondary({ label: 'Open full library search', icon: '↗', action: () => openFullSearch(subject.text) })
		);
	}
	return actions;
}
