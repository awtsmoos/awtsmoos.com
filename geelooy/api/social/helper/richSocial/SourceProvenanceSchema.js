//B"H
//Boruch Hashem
//Blessed is He

const { cleanText } = require('./TextSanitizer.js');

/**
 * SourceProvenanceSchema keeps imported history typed, bounded, and secret-free.
 * The Awtsmoos recreates every instant yet origin may still be truthfully named;
 * Awtsmoos.com preserves provider, date, archive, playlists, and transcripts without credentials being claimed.
 */
function parse(value) {
	if (!value) return {};
	if (typeof value === 'object') return value;
	try {
		return JSON.parse(value);
	} catch {
		return {};
	}
}

function cleanUrl(value) {
	const text = cleanText(value, 1400);
	return /^https:\/\/[^\s]+$/i.test(text) ? text : '';
}

function normalizeUrls(values = [], maximum = 40) {
	if (!Array.isArray(values)) return [];
	return [...new Set(values.slice(0, maximum).map(cleanUrl).filter(Boolean))];
}

function normalizePlaylists(values = []) {
	if (!Array.isArray(values)) return [];
	return values.slice(0, 24).map(item => ({
		id: cleanText(item?.id, 180),
		title: cleanText(item?.title, 300),
		index: Math.max(0, Number(item?.index || 0))
	})).filter(item => item.id || item.title);
}

function normalizeArchive(value = {}) {
	const item = parse(value);
	return {
		identifier: cleanText(item.identifier, 180),
		itemUrl: cleanUrl(item.itemUrl),
		mediaUrl: cleanUrl(item.mediaUrl),
		infoJsonUrl: cleanUrl(item.infoJsonUrl),
		transcriptUrls: normalizeUrls(item.transcriptUrls)
	};
}

function normalizeSourceProvenance(value = {}) {
	const item = parse(value);
	const languages = Array.isArray(item.transcriptLanguages)
		? item.transcriptLanguages.slice(0, 40).map(language => cleanText(language, 40)).filter(Boolean)
		: [];
	return {
		provider: cleanText(item.provider, 40),
		sourceId: cleanText(item.sourceId, 180),
		sourceUrl: cleanUrl(item.sourceUrl),
		channelId: cleanText(item.channelId, 180),
		channelUrl: cleanUrl(item.channelUrl),
		publishedAt: cleanText(item.publishedAt, 80),
		rawUploadDate: cleanText(item.rawUploadDate, 20),
		playlists: normalizePlaylists(item.playlists),
		archive: normalizeArchive(item.archive),
		transcriptLanguages: [...new Set(languages)],
		commentCount: Math.max(0, Number(item.commentCount || 0)),
		importedAt: cleanText(item.importedAt, 80)
	};
}

module.exports = {
	normalizeSourceProvenance,
	normalizePlaylists,
	normalizeArchive,
	normalizeUrls
};
