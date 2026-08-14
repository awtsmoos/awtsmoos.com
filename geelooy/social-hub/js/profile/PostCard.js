//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PostCard
 * @description
 * The Awtsmoos lets a public profile reveal authored work as human context first and machinery never.
 * Awtsmoos.com keeps the real post doorway primary while alias-owned composition and comment actions
 * appear only when an authenticated public alias is actually active.
 */

import {
	actionLink,
	cardActions,
	textElement
} from './CardElements.js';

function postContext(post) {
	return [post.heichelName || post.heichelId, post.seriesName || post.seriesId]
		.filter(Boolean)
		.join(' · ');
}

function openPath(post, source) {
	return post.path || `/heichelos/${post.heichelId}/post/${source}`;
}

function aliasActions(document, actions, post, source, aliasId) {
	if (!aliasId) return;
	actions.append(
		actionLink(
			document,
			'Add to Heichel',
			`/social-composer/?alias=${encodeURIComponent(aliasId)}&source=${encodeURIComponent(source)}&sourceHeichel=${encodeURIComponent(post.heichelId || '')}&sourceSeries=${encodeURIComponent(post.seriesId || 'root')}`
		),
		actionLink(
			document,
			'Comment',
			`/social-hub/?alias=${encodeURIComponent(aliasId)}&heichel=${encodeURIComponent(post.heichelId || '')}&series=${encodeURIComponent(post.seriesId || 'root')}&post=${encodeURIComponent(source)}#interact`
		)
	);
}

export function postCard({ document, post, aliasId }) {
	const card = document.createElement('article');
	card.className = 'profileCard riftCard';
	const source = post.postId || post.id;
	const title = textElement(document, 'h3', post.title || source || 'Untitled post');
	const summary = textElement(
		document,
		'p',
		post.description || post.summary || 'Public post',
		'cardSummary'
	);
	card.append(title, summary);
	const context = postContext(post);
	if (context) {
		card.append(textElement(document, 'p', context, 'profilePostContext'));
	}
	const actions = cardActions(document);
	const open = actionLink(document, 'Open post →', openPath(post, source));
	open.classList.add('profileCardPrimaryAction');
	actions.append(open);
	aliasActions(document, actions, post, source, aliasId);
	card.append(actions);
	return card;
}

export {
	postContext,
	openPath
};
