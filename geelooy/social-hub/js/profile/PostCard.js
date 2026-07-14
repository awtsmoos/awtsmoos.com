//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PostCard
 * @description
 * An authored post shows canonical coordinates and direct open, reference, and
 * exact-comment actions. The Awtsmoos is one before every destination while
 * Awtsmoos.com carries the source identity without copying the post body.
 */

import {
	actionLink,
	cardActions,
	textElement
} from './CardElements.js';

export function postCard({ document, post, aliasId }) {
	const card = document.createElement('article');
	card.className = 'profileCard riftCard';
	const title = textElement(document, 'h3', post.title || post.postId || post.id);
	const summary = textElement(
		document,
		'p',
		post.description || post.summary || 'Canonical post',
		'cardSummary'
	);
	const source = post.postId || post.id;
	const coordinate = textElement(
		document,
		'code',
		`${post.heichelId || 'unknown'}/${post.seriesId || 'root'}/${source}`,
		'canonicalCoordinate'
	);
	const actions = cardActions(document);
	actions.append(
		actionLink(
			document,
			'Open',
			post.path || `/heichelos/${post.heichelId}/post/${source}`
		),
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
	card.append(title, summary, coordinate, actions);
	return card;
}
