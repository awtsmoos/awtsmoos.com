//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CommentCard
 * @description
 * A canonical rich comment reveals reply lineage, exact target, media, references,
 * and promotion action. The Awtsmoos gives every response a true place while
 * Awtsmoos.com lets it answer again or widen into a post without erasing its thread.
 */

import {
	actionLink,
	cardActions,
	textElement
} from './CardElements.js';

export function commentCard({ document, comment, aliasId, onPromote }) {
	const card = document.createElement('article');
	card.className = 'profileCard commentProfileCard riftCard';
	const content = textElement(
		document,
		'p',
		comment.content || comment.audioNoteText || 'Media comment',
		'commentExcerpt'
	);
	const coordinate = textElement(
		document,
		'code',
		[
			comment.heichelId,
			comment.seriesId,
			comment.postId,
			comment.subsectionId || comment.verseSection || 'root',
			comment.parentId ? `reply:${comment.parentId}` : ''
		].filter(Boolean).join('/'),
		'canonicalCoordinate'
	);
	const media = textElement(
		document,
		'p',
		`${comment.assets?.length || 0} media · ${comment.links?.length || 0} references`,
		'cardMeta'
	);
	const actions = cardActions(document);
	actions.append(actionLink(
		document,
		'Reply',
		`/social-hub/?alias=${encodeURIComponent(aliasId)}&heichel=${encodeURIComponent(comment.heichelId)}&series=${encodeURIComponent(comment.seriesId)}&post=${encodeURIComponent(comment.postId)}&reply=${encodeURIComponent(comment.id)}#interact`
	));
	const promote = document.createElement('button');
	promote.type = 'button';
	promote.textContent = 'Become a post';
	promote.addEventListener('click', () => onPromote(comment));
	actions.append(promote);
	card.append(content, coordinate, media, actions);
	return card;
}
