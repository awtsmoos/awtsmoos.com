//B"H
//Boruch Hashem
//Blessed is He

/**
 * BinahYouTubeManifest keeps only fields needed to plan native Awtsmoos publication.
 * The Awtsmoos gathers metadata from many sidecars into one bounded form;
 * Awtsmoos.com strips local paths before server planning so private disks never become the norm.
 */
function clean(value, maximum = 5000) {
	return String(value || '').replace(/[\u0000-\u0008]/g, '').trim().slice(0, maximum);
}

function normalizePlaylist(item = {}) {
	return {
		id: clean(item.id, 180),
		title: clean(item.title, 300),
		index: Math.max(0, Number(item.index || 0))
	};
}

function normalizeUrls(values = []) {
	if (!Array.isArray(values)) return [];
	return [...new Set(values.slice(0, 40).map(value => clean(value, 1400)).filter(Boolean))];
}

function normalizeArchive(value = {}) {
	return {
		identifier: clean(value.identifier, 180),
		itemUrl: clean(value.itemUrl, 1400),
		mediaUrl: clean(value.mediaUrl, 1400),
		infoJsonUrl: clean(value.infoJsonUrl, 1400),
		transcriptUrls: normalizeUrls(value.transcriptUrls)
	};
}

function normalizeItem(value = {}) {
	return {
		id: clean(value.id, 180),
		title: clean(value.title || value.id, 300),
		description: clean(value.description, 20000),
		publishedAt: clean(value.publishedAt, 80),
		rawUploadDate: clean(value.rawUploadDate, 20),
		channel: clean(value.channel, 300),
		channelId: clean(value.channelId, 180),
		channelUrl: clean(value.channelUrl, 1400),
		webpageUrl: clean(value.webpageUrl, 1400),
		playlistMemberships: Array.isArray(value.playlistMemberships)
			? value.playlistMemberships.slice(0, 24).map(normalizePlaylist)
			: [],
		transcriptLanguages: Array.isArray(value.transcriptLanguages)
			? value.transcriptLanguages.slice(0, 40).map(language => clean(language, 40))
			: [],
		commentCount: Math.max(0, Number(value.commentCount || 0)),
		archive: normalizeArchive(value.archive || {})
	};
}

function normalizeMap(value = {}) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
	return Object.fromEntries(
		Object.entries(value).slice(0, 100).map(([key, seriesId]) => [
			clean(key, 180),
			clean(seriesId, 120)
		]).filter(([key, seriesId]) => key && seriesId)
	);
}

function normalizeManifest(value = {}) {
	return {
		aliasId: clean(value.aliasId, 120),
		heichelId: clean(value.heichelId, 120),
		fallbackSeriesId: clean(value.fallbackSeriesId, 120),
		playlistSeriesMap: normalizeMap(value.playlistSeriesMap),
		items: Array.isArray(value.items) ? value.items.map(normalizeItem).filter(item => item.id) : []
	};
}

module.exports = {
	normalizePlaylist,
	normalizeArchive,
	normalizeItem,
	normalizeManifest
};
