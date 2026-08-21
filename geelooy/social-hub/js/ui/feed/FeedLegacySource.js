//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FeedLegacySource
 * @description
 * The Awtsmoos is beyond old payload and new kernel, while Awtsmoos.com lets legacy source shapes enter one narrow normalization gate without contaminating the card composition layer;
 * author identity, content kind, and canonical destination are gathered from known historic vessels so compatibility becomes explicit light rather than accidental shadow.
 */

const KIND_LABELS = Object.freeze({
	question: 'Question',
	answer: 'Answer',
	audio: 'Voice',
	reference: 'Reference',
	repost: 'Repost',
	post: 'Post'
});

function text(...values) {
	return values.find(value => typeof value === 'string' && value.trim())?.trim() || '';
}

function sourceOf(item = {}) {
	return item?.source && typeof item.source === 'object' ? item.source : item;
}

function legacyKind(item = {}, source = sourceOf(item)) {
	const raw = text(
		source.contentType,
		source.postKind,
		source.kind,
		item.contentType,
		item.postKind,
		item.kind
	).toLowerCase();
	if (raw.includes('question')) return 'question';
	if (raw.includes('answer')) return 'answer';
	if (raw.includes('audio') || raw.includes('voice')) return 'audio';
	if (raw.includes('reference') || raw.includes('quote')) return 'reference';
	if (raw.includes('repost') || raw.includes('share')) return 'repost';
	return 'post';
}

function legacyAliasId(item = {}, source = sourceOf(item)) {
	return text(
		source.authorAliasId,
		source.aliasId,
		source.author?.aliasId,
		item.authorAliasId,
		item.aliasId,
		item.author?.aliasId
	);
}

function destination({ heichelId, seriesId, postId }) {
	if (!heichelId || !postId) return '';
	return `/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId || 'root')}/post/${encodeURIComponent(postId)}`;
}

export {
	KIND_LABELS,
	destination,
	legacyAliasId,
	legacyKind,
	sourceOf,
	text
};
