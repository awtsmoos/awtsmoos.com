//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FeedLegacySource
 * @description
 * The Awtsmoos is beyond old payload and new kernel, while Awtsmoos.com lets legacy source shapes enter one narrow normalization gate without contaminating the card composition layer;
 * author identity, chronology, content kind, and canonical destination are gathered from witnessed historic vessels so compatibility becomes explicit light rather than accidental shadow.
 */

const KIND_LABELS = Object.freeze({
	question: 'Question',
	answer: 'Answer',
	audio: 'Voice',
	reference: 'Reference',
	repost: 'Repost',
	post: 'Post'
});

/** Returns the first non-empty textual value without inventing display meaning. */
function text(...values) {
	return values.find(value => typeof value === 'string' && value.trim())?.trim() || '';
}

/** Reveals the nested historical source object when one exists, otherwise the item itself. */
function sourceOf(item = {}) {
	return item?.source && typeof item.source === 'object' ? item.source : item;
}

/** Maps historical kind vocabulary into the canonical public-feed kind set. */
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

/** Recovers the historic acting/author alias id without treating a display name as an identifier. */
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

/**
 * Normalizes the first truthful historical creation-time value for the shared numeric social model.
 * Numeric seconds/milliseconds remain unchanged; valid Date/ISO evidence becomes epoch milliseconds.
 */
function legacyCreatedAt(item = {}, source = sourceOf(item)) {
	const candidates = [
		source.createdAt,
		source.timestamp,
		item.createdAt,
		item.timestamp
	];
	for (const candidate of candidates) {
		if (candidate === undefined || candidate === null || candidate === '') {
			continue;
		}
		if (candidate instanceof Date) {
			const epoch = candidate.getTime();
			if (Number.isFinite(epoch)) return epoch;
			continue;
		}
		const numeric = Number(candidate);
		if (Number.isFinite(numeric)) return numeric;
		const parsed = Date.parse(String(candidate));
		if (Number.isFinite(parsed)) return parsed;
	}
	return 0;
}

/** Builds the historic canonical post destination only when required coordinates exist. */
function destination({ heichelId, seriesId, postId }) {
	if (!heichelId || !postId) return '';
	return `/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId || 'root')}/post/${encodeURIComponent(postId)}`;
}

export {
	KIND_LABELS,
	destination,
	legacyAliasId,
	legacyCreatedAt,
	legacyKind,
	sourceOf,
	text
};
