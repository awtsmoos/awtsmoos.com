//B"H
//Boruch Hashem
//Blessed is He

const { cleanText } = require('./TextSanitizer.js');

/**
 * @module SourceProvenanceSchema
 * @description
 * The Awtsmoos lets imported memory carry its former address without becoming the former network;
 * Awtsmoos.com preserves bounded provenance for YouTube, Facebook, Instagram, and future trusted migrations.
 */
function parse(value, fallback) {
	if (value === undefined || value === null || value === '') return fallback;
	if (typeof value === 'object') return value;
	try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
}

function cleanUrl(value = '') {
	const text = cleanText(value, 2000);
	return /^https:\/\//i.test(text) ? text : '';
}

function normalizeUrls(value, max = 40) {
	const list = parse(value, []);
	return (Array.isArray(list) ? list : [])
		.map(cleanUrl)
		.filter(Boolean)
		.slice(0, max);
}

function normalizePaths(value, max = 40) {
	const list = parse(value, []);
	return [...new Set((Array.isArray(list) ? list : [])
		.map(item => cleanText(item, 1600))
		.filter(Boolean))].slice(0, max);
}

function normalizePlaylists(value) {
	const list = parse(value, []);
	return (Array.isArray(list) ? list : []).slice(0, 24).map(item => ({
		id: cleanText(item?.id, 160),
		title: cleanText(item?.title, 400),
		url: cleanUrl(item?.url)
	}));
}

function normalizeProfile(value = {}) {
	const profile = parse(value, {});
	return {
		id: cleanText(profile?.id, 240),
		name: cleanText(profile?.name || profile?.username, 400),
		url: cleanUrl(profile?.url)
	};
}

function normalizeArchive(value = {}) {
	const archive = parse(value, {});
	return {
		identifier: cleanText(archive?.identifier, 240),
		itemUrl: cleanUrl(archive?.itemUrl),
		mediaUrl: cleanUrl(archive?.mediaUrl),
		infoJsonUrl: cleanUrl(archive?.infoJsonUrl),
		transcriptUrls: normalizeUrls(archive?.transcriptUrls, 24),
		rawPath: cleanText(archive?.rawPath, 1600),
		mediaPaths: normalizePaths(archive?.mediaPaths, 40)
	};
}

function safeCount(value) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? Math.floor(number) : 0;
}

function normalizeSourceProvenance(value = {}) {
	const input = parse(value, {});
	return {
		provider: cleanText(input?.provider, 80),
		sourceId: cleanText(input?.sourceId, 240),
		sourceUrl: cleanUrl(input?.sourceUrl),
		sourceType: cleanText(input?.sourceType, 80),
		sourceProfile: normalizeProfile(input?.sourceProfile),
		channelId: cleanText(input?.channelId, 240),
		channelUrl: cleanUrl(input?.channelUrl),
		publishedAt: cleanText(input?.publishedAt, 80),
		rawUploadDate: cleanText(input?.rawUploadDate, 80),
		playlists: normalizePlaylists(input?.playlists),
		archive: normalizeArchive(input?.archive),
		transcriptLanguages: normalizePaths(input?.transcriptLanguages, 32),
		reactionCount: safeCount(input?.reactionCount),
		commentCount: safeCount(input?.commentCount),
		shareCount: safeCount(input?.shareCount),
		importedAt: cleanText(input?.importedAt, 80)
	};
}

module.exports = {
	parse,
	cleanUrl,
	normalizeSourceProvenance
};
