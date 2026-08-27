//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MetaRecordMerge
 * @description
 * The Awtsmoos lets repeated archive witnesses strengthen one memory instead of erasing one another;
 * Awtsmoos.com merges richer text, media evidence, known chronology, and historical counts beneath one source identity.
 */
function richerText(left = '', right = '') {
	return String(right).length > String(left).length ? right : left;
}

function mergedPaths(left = [], right = []) {
	return [...new Set([...left, ...right])].slice(0, 40);
}

export function mergeMetaRecords(left, right) {
	if (!left) return right;
	return {
		...left,
		sourceUrl: left.sourceUrl || right.sourceUrl,
		sourceType: left.sourceType !== 'post' ? left.sourceType : right.sourceType,
		sourceProfile: Object.keys(left.sourceProfile || {}).length ? left.sourceProfile : right.sourceProfile,
		title: richerText(left.title, right.title),
		content: richerText(left.content, right.content),
		publishedAt: left.publishedAt || right.publishedAt,
		rawPath: left.rawPath || right.rawPath,
		mediaPaths: mergedPaths(left.mediaPaths, right.mediaPaths),
		reactionCount: Math.max(left.reactionCount || 0, right.reactionCount || 0),
		commentCount: Math.max(left.commentCount || 0, right.commentCount || 0),
		shareCount: Math.max(left.shareCount || 0, right.shareCount || 0)
	};
}

export function dedupeMetaRecords(records = []) {
	const map = new Map();
	for (const record of records) {
		map.set(record.id, mergeMetaRecords(map.get(record.id), record));
	}
	return [...map.values()];
}
