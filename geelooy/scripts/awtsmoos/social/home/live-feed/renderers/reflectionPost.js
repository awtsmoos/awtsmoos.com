// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicReflectionPostRenderer
 * @description
 * The Awtsmoos lets reflection and canonical source face one another without
 * collapse. Awtsmoos.com keeps quotation, citation, and prose semantically distinct.
 */
import { createElement, createLink } from '../card/domFactory.js';
import { renderTextPost } from './textPost.js';

/**
 * Renders a source reflection with optional quotation and citation panels.
 *
 * @param {object} model - Normalized post model.
 * @returns {HTMLElement} Reflection layout.
 */
export function renderReflectionPost(model) {
	const layout = createElement('section', 'post-content post-reflection-layout');
	const body = renderTextPost(model);
	const side = createElement('aside', 'post-reflection-side', {
		'aria-label': 'Quotation and canonical source'
	});

	if (model.special.quote) {
		const quote = createElement('blockquote', 'post-quote-panel');
		quote.append(createElement('p', '', {}, model.special.quote));
		side.append(quote);
	}

	if (model.special.citation.label) {
		const citation = createElement('section', 'post-citation-panel');
		citation.append(
			createElement('span', 'post-panel-kicker', {}, 'Canonical source'),
			model.special.citation.href
				? createLink(
					model.special.citation.label,
					model.special.citation.href,
					'post-citation-link'
				)
				: createElement('strong', '', {}, model.special.citation.label)
		);
		side.append(citation);
	}

	if (model.special.participants.length) {
		side.append(renderVoices(model.special.participants));
	}

	layout.append(body);

	if (side.childElementCount) {
		layout.append(side);
	}

	return layout;
}

function renderVoices(participants) {
	const section = createElement('section', 'post-voices');
	const stack = createElement('div', 'post-avatar-stack', {
		'aria-hidden': 'true'
	});

	participants.slice(0, 4).forEach(participant => {
		const name = typeof participant === 'string'
			? participant
			: participant.name || participant.alias || 'Voice';
		stack.append(createElement('span', '', {}, String(name).slice(0, 1).toUpperCase()));
	});

	section.append(
		stack,
		createElement('span', '', {}, 'Voices unfolding this idea')
	);
	return section;
}
