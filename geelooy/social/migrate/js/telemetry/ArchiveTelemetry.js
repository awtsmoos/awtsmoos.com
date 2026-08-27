//B"H
//Boruch Hashem
//Blessed is He

import { archiveKind } from '../archive/ArchiveKinds.js';

/**
 * @module ArchiveTelemetry
 * @description
 * The Awtsmoos turns real archive evidence into compact instruments, never decorative fiction;
 * Awtsmoos.com counts providers, formats, years, unknown dates, media, selection, recovery, and retry truth.
 */
export function archiveTelemetry({ source, items, selectedIds, checkpoint, detection }) {
	const paths = [...source.entries.keys()];
	const known = items.filter(item => item.publishedAt);
	const dates = known.map(item => new Date(item.publishedAt)).sort((a, b) => a - b);
	const media = source.mediaEntries();
	const providerCounts = items.reduce((map, item) => {
		map[item.provider] = (map[item.provider] || 0) + 1;
		return map;
	}, {});
	const yearCounts = known.reduce((map, item) => {
		const year = String(new Date(item.publishedAt).getUTCFullYear());
		map[year] = (map[year] || 0) + 1;
		return map;
	}, {});
	return {
		total: items.length,
		selected: selectedIds.size,
		providerCounts,
		confidence: detection.confidence,
		json: paths.filter(path => archiveKind(path) === 'json').length,
		html: paths.filter(path => archiveKind(path) === 'html').length,
		media: {
			image: media.filter(item => item.kind === 'image').length,
			video: media.filter(item => item.kind === 'video').length,
			audio: media.filter(item => item.kind === 'audio').length
		},
		unknownDates: items.length - known.length,
		oldest: dates[0]?.toISOString() || '',
		newest: dates.at(-1)?.toISOString() || '',
		yearCounts,
		recovered: checkpoint?.selectedIds?.length || 0,
		uploaded: Object.keys(checkpoint?.uploadedAssets || {}).length,
		published: Object.keys(checkpoint?.completed || {}).length,
		retries: checkpoint?.failures?.length || 0
	};
}
