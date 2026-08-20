//B"H
//Boruch Hashem
//Blessed is He

const { youtubeProvenance } = require('./SourceProvenance.js');

/**
 * DaasYouTubeMigrationPlan maps playlists to Series while preserving one canonical post.
 * The Awtsmoos is one beyond division while reflections may enter many rooms;
 * Awtsmoos.com gives one Series the canonical seed and other playlists reference blooms.
 */
function mappedSeries(item, map = {}) {
	const values = item.playlistMemberships
		.map(playlist => String(map[playlist.id] || '').trim())
		.filter(Boolean);
	return [...new Set(values)].slice(0, 24);
}

function chronology(item) {
	const date = new Date(item.publishedAt || 0);
	if (Number.isNaN(date.valueOf())) {
		return { year: 'Unknown', month: 'Unknown' };
	}
	return {
		year: String(date.getUTCFullYear()),
		month: String(date.getUTCMonth() + 1).padStart(2, '0')
	};
}

function entryFor(item, manifest) {
	const mapped = mappedSeries(item, manifest.playlistSeriesMap);
	const primarySeriesId = mapped[0] || manifest.fallbackSeriesId;
	const secondary = mapped.slice(1).map(seriesId => ({
		heichelId: manifest.heichelId,
		seriesId,
		kind: 'reference'
	}));
	const sourceProvenance = youtubeProvenance(item);
	return {
		sourceId: item.id,
		chronology: chronology(item),
		publicationPlan: {
			idempotencyKey: `youtube:${item.id}:${manifest.aliasId}:${manifest.heichelId}:${primarySeriesId}`.slice(0, 160),
			aliasId: manifest.aliasId,
			contentKind: 'video',
			primary: {
				heichelId: manifest.heichelId,
				seriesId: primarySeriesId,
				kind: 'canonical'
			},
			secondary,
			visibility: 'public'
		},
		contentPayload: {
			title: item.title,
			content: item.description || item.title,
			summary: item.description,
			sourceProvenance,
			rootAssets: item.archive.mediaUrl ? [{
				kind: 'video',
				url: item.archive.mediaUrl,
				title: item.title
			}] : []
		}
	};
}

function buildMigrationPlan(manifest) {
	const entries = manifest.items.map(item => entryFor(item, manifest));
	return {
		version: 1,
		entries,
		years: entries.reduce((map, entry) => {
			const key = `${entry.chronology.year}-${entry.chronology.month}`;
			map[key] = (map[key] || 0) + 1;
			return map;
		}, {})
	};
}

module.exports = {
	mappedSeries,
	chronology,
	entryFor,
	buildMigrationPlan
};
