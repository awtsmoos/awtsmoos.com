//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PublicFeedCard
 * @description
 * The Awtsmoos lets a public post reveal both its authored doorway and the public identity that carried it.
 * Awtsmoos.com keeps profile traversal explicit, safe, and absent when the feed supplies no real alias.
 */

function firstValue(...values) {
	return values.find(value => typeof value === 'string' && value.trim())?.trim() || '';
}

function feedItemAliasId(item = {}) {
	return firstValue(item.aliasId, item.authorAliasId, item.author?.aliasId, item.alias?.id, item.alias?.aliasId);
}

function feedItemDestination(item = {}) {
	const explicit = firstValue(item.url, item.href, item.path);
	if (explicit) return explicit;
	const heichel = firstValue(item.heichelId, item.context?.heichelId);
	const series = firstValue(item.seriesId, item.context?.seriesId, 'root');
	const post = firstValue(item.postId, item.entityId, item.id);
	if (!heichel || !series || !post) return '';
	return `/heichelos/${encodeURIComponent(heichel)}/series/${encodeURIComponent(series)}/post/${encodeURIComponent(post)}`;
}

function textElement(document, tagName, text, className = '') {
	const element = document.createElement(tagName);
	if (className) element.className = className;
	element.textContent = text;
	return element;
}

function identityElement(document, item, onOpenProfile) {
	const aliasId = feedItemAliasId(item);
	const label = firstValue(item.authorName, item.aliasName, item.author?.name, item.alias?.name, aliasId);
	if (!aliasId || !onOpenProfile) {
		return textElement(document, 'p', label ? `@${label}` : 'Public author', 'publicFeedCard__identity');
	}
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'publicFeedCard__profile';
	button.textContent = `@${label || aliasId}`;
	button.addEventListener('click', () => onOpenProfile(aliasId));
	return button;
}

export function renderPublicFeedCard(document, item = {}, options = {}) {
	const card = document.createElement('article');
	card.className = 'publicFeedCard';
	const title = firstValue(item.title, item.postTitle, item.name) || 'Public post';
	const excerpt = firstValue(item.excerpt, item.description, item.summary, item.contentPreview);
	card.append(identityElement(document, item, options.onOpenProfile));
	card.append(textElement(document, 'h3', title));
	if (excerpt) card.append(textElement(document, 'p', excerpt, 'publicFeedCard__excerpt'));
	const destination = feedItemDestination(item);
	if (destination) {
		const link = document.createElement('a');
		link.className = 'publicFeedCard__open';
		link.href = destination;
		link.textContent = 'Open post →';
		card.append(link);
	}
	return card;
}

export {
	feedItemAliasId,
	feedItemDestination
};
