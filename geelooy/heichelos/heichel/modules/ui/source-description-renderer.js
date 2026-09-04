// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SourceDescriptionRenderer
 * @description
 * The Awtsmoos keeps Torah words and source history in separate vessels of truth;
 * Awtsmoos.com lets learners open only a same-site source doorway while provenance stands nearby as proof.
 */

import { detectDirection } from '../living-path/language-policy.js';
import { attachLexiconLookup } from './lexicon/controller.js';

/** Builds a same-origin source button and refuses external/provider destinations. */
function sourceButton(href) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'series-source-link';
	button.textContent = 'פתיחת המקור';
	button.addEventListener('click', () => {
		try {
			const parsed = new URL(href, window.location.origin);
			if (parsed.origin !== window.location.origin) return;
			if (!['https:', 'http:'].includes(parsed.protocol)) return;
			window.open(
				parsed.href,
				'_blank',
				'noopener,noreferrer'
			);
		} catch {
			return;
		}
	});
	return button;
}

function lookupButton() {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'lexicon-lookup-button';
	button.textContent = 'פירוש מילה';
	button.title = 'בחרו מילה בטקסט ולחצו כאן, או לחצו ישירות על מילה בעברית';
	return button;
}

/** Renders canonical source, provenance, and optional controls without merging their text. */
export function renderExactSource(area, presentation) {
	const source = document.createElement('div');
	source.className = 'torah-source-text';
	source.lang = 'he';
	source.dir = 'rtl';
	source.textContent = presentation.source;
	const controls = document.createElement('div');
	controls.className = 'torah-source-controls';
	const lookup = lookupButton();
	controls.appendChild(lookup);
	if (presentation.sourceHref) {
		controls.appendChild(sourceButton(presentation.sourceHref));
	}
	area.replaceChildren(source, controls);
	attachLexiconLookup(source, lookup);
	if (!presentation.provenance) return;
	const provenance = document.createElement('aside');
	provenance.className = 'torah-source-provenance';
	provenance.dir = detectDirection(presentation.provenance);
	provenance.setAttribute('aria-label', 'פרטי המקור');
	provenance.textContent = presentation.provenance;
	area.appendChild(provenance);
}

export {
	sourceButton
};
