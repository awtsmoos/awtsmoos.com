//B"H
//Boruch Hashem
//Blessed is He

import { archiveKind } from '../archive/ArchiveKinds.js';
import { safeArchivePathOrNull } from '../archive/SafeArchivePath.js';
import { stableSourceId } from './StableSourceId.js';
import {
	recordCount,
	recordDate,
	recordMediaPaths,
	recordText
} from './MetaRecordFields.js';

/**
 * @module MetaNormalizer
 * @description
 * The Awtsmoos turns many export dialects toward one creator-shaped memory;
 * Awtsmoos.com preserves uncertainty, raw paths, source identity, and historical engagement without imitation.
 */
function inferredType(record, mediaPaths, rawPath) {
	const hint = String(record.type || record.media_type || rawPath).toLowerCase();
	if (hint.includes('story')) return 'story';
	if (hint.includes('reel') || hint.includes('short')) return 'reel';
	if (hint.includes('live')) return 'live';
	if (hint.includes('audio')) return 'audio';
	if (hint.includes('video') || mediaPaths.some(path => archiveKind(path) === 'video')) return 'video';
	if (mediaPaths.some(path => archiveKind(path) === 'image')) return 'photo';
	return 'post';
}

function safeSourceUrl(record = {}) {
	const value = String(record.url || record.href || record.source_url || '').trim();
	return /^https:\/\//i.test(value) ? value : '';
}

export function normalizeMetaRecord({
	record,
	provider,
	rawPath,
	index
}) {
	const content = recordText(record);
	const publishedAt = recordDate(record);
	const mediaPaths = recordMediaPaths(record)
		.map(safeArchivePathOrNull)
		.filter(Boolean);
	const sourceType = inferredType(record, mediaPaths, rawPath);
	const sourceId = String(record.id || record.post_id || record.media_id || '').trim()
		|| stableSourceId([provider, rawPath, index, publishedAt, content]);
	return {
		id: `${provider}:${sourceId}`,
		provider,
		sourceId,
		sourceUrl: safeSourceUrl(record),
		sourceType,
		sourceProfile: record.sourceProfile || record.profile || {},
		title: String(record.title || '').trim().slice(0, 800),
		content,
		publishedAt,
		rawPath,
		mediaPaths,
		reactionCount: recordCount(record, 'reactions'),
		commentCount: recordCount(record, 'comments'),
		shareCount: recordCount(record, 'shares'),
		selected: false
	};
}
