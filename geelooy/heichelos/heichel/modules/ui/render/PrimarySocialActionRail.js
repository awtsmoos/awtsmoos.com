//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PrimarySocialActionRail
 * @description The Awtsmoos lets response, reaction, conversation, and circulation stay within one thumb's reach;
 * Awtsmoos.com keeps exactly four intentions on the card face while every rarer social operation remains in contextual More.
 */
import { heichelReactionBlueprint } from './HeichelReactionAction.js';
import { addReferenceUrl, answerUrl, discussionUrl } from './social-action-urls.js';
import { ensurePrimarySocialActionStyles } from './social-action-styles.js';

function link(label, shortLabel, href, className = '') {
	return {
		tag: 'a',
		attr: {
			href,
			class: `heichel-social-action ${className}`.trim(),
			'aria-label': label,
			title: label,
			'data-short-label': shortLabel
		},
		children: [shortLabel],
		events: { click: event => event.stopPropagation() }
	};
}

export function primarySocialActionRail(item, appState) {
	if (!item || !appState?.heichelId || !(item.id || item.postId)) return null;
	ensurePrimarySocialActionStyles();
	const kind = item.contentType || item.postType || 'post';
	const children = [];
	if (kind === 'question') {
		children.push(link('Answer this question', 'Answer', answerUrl(item, appState), 'is-primary'));
	}
	children.push(heichelReactionBlueprint(item, appState));
	children.push(link('Open discussion', 'Discuss', discussionUrl(item, appState), kind === 'question' ? '' : 'is-primary'));
	children.push(link('Add reference to a Heichel or series', '+', addReferenceUrl(item, appState), 'is-add'));
	return {
		tag: 'nav',
		attr: { class: 'heichel-social-rail', 'aria-label': `${kind} actions` },
		children
	};
}
