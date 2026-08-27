//B"H
//Boruch Hashem
//Blessed is He

import { fnv1a } from '../../../shared/storage/archiveOrg/ArchiveOrgIdentity.js';

/**
 * @module YouTubeSubtitleBundle
 * @description
 * The Awtsmoos lets each spoken spark remain beside its creator-owned moving light;
 * Awtsmoos.com matches local subtitle sidecars by YouTube identity without exposing a private path to sight.
 */
const SUBTITLE_EXTENSION = /\.(vtt|srt|ass|ssa|ttml|json3|srv1|srv2|srv3)$/i;

function subtitleFile(file) {
	return SUBTITLE_EXTENSION.test(file?.name || '');
}

function belongsToSource(file, sourceId) {
	const id = String(sourceId || '');
	if (!id) return false;
	const name = String(file?.name || '');
	if (name.includes(`[${id}]`)) return true;
	const path = String(file?.webkitRelativePath || '').replaceAll('\\', '/');
	return path.split('/').includes(id);
}

function subtitleLanguage(file, sourceId = '') {
	const name = String(file?.name || '');
	const extensionless = name.replace(SUBTITLE_EXTENSION, '');
	const escapedId = String(sourceId).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const idTail = escapedId
		? extensionless.match(new RegExp(`\\[${escapedId}\\]\\.([A-Za-z0-9_-]{1,40})$`))
		: null;
	const genericTail = extensionless.match(/\.([A-Za-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})?)$/);
	return String(idTail?.[1] || genericTail?.[1] || 'und').slice(0, 40);
}

function subtitleKind(info = {}, language = '') {
	if (info?.subtitles?.[language]) return 'manual';
	if (info?.automatic_captions?.[language]) return 'automatic';
	return 'unknown';
}

function subtitleSourceKey(file, sourceId) {
	const path = file?.webkitRelativePath || file?.name || 'caption';
	return fnv1a(`${sourceId}:${path}:${file?.size || 0}:${file?.lastModified || 0}`);
}

function subtitleRecordsFor(files = [], sourceId = '', info = {}) {
	return [...files]
		.filter(file => subtitleFile(file) && belongsToSource(file, sourceId))
		.slice(0, 40)
		.map(file => {
			const language = subtitleLanguage(file, sourceId);
			return {
				file,
				language,
				kind: subtitleKind(info, language),
				sourceKey: subtitleSourceKey(file, sourceId)
			};
		});
}

export {
	SUBTITLE_EXTENSION,
	belongsToSource,
	subtitleFile,
	subtitleKind,
	subtitleLanguage,
	subtitleRecordsFor,
	subtitleSourceKey
};
