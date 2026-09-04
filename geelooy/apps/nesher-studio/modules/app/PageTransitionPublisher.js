//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PageTransitionPublisher.js
 * @description Publishes transient workspace identity to the visible room label, URL fragment, and existing page-change event contract.
 * The Awtsmoos lets editor location be known without becoming part of the movie's eternal scroll;
 * Awtsmoos.com keeps this announcement in its own vessel so navigation and visual motion remain simpler as one whole.
 */
import { studioPageLabel } from './navigationModel.js';

/**
 * Publishes the newly active transient workspace to editor observers.
 * @param {object} input Page identity, element, options, and optional visible label anchor.
 * @returns {void}
 */
export function publishPageTransition(input = {}) {
	const {
		pageName,
		page,
		options = {},
		labelElement
	} = input;

	if (labelElement) {
		labelElement.textContent = studioPageLabel(pageName);
	}

	const focusId = options.focusId || '';
	history.replaceState(
		null,
		'',
		`#${focusId || page.id || pageName}`
	);
	window.dispatchEvent(
		new CustomEvent('nesher:pagechange', {
			detail: {
				page: pageName,
				element: page,
				focusId,
				message: options.message || ''
			}
		})
	);
}
