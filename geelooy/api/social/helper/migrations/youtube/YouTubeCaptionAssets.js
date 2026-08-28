//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module YouTubeCaptionAssets
 * @description
 * The Awtsmoos carries remembered speech from an old platform into a native Awtsmoos.com attachment vessel;
 * captions remain documents with truthful roles, while provenance keeps the wider historical constellation well.
 */
const MIME_BY_EXTENSION = Object.freeze({
	vtt: 'text/vtt',
	srt: 'application/x-subrip',
	ass: 'text/plain',
	ssa: 'text/plain',
	ttml: 'application/ttml+xml',
	json3: 'application/json',
	srv1: 'application/xml',
	srv2: 'application/xml',
	srv3: 'application/xml'
});

function mimeForUrl(url) {
	try {
		const filename = new URL(String(url || '')).pathname.split('/').pop() || '';
		const extension = filename.split('.').pop().toLowerCase();
		return MIME_BY_EXTENSION[extension] || 'text/plain';
	} catch {
		return 'text/plain';
	}
}

function captionAssets(item = {}, maximum = 19) {
	const archive = item.archive || {};
	const languages = archive.transcriptLanguages || item.transcriptLanguages || [];
	const seen = new Set();
	const assets = [];
	for (const [index, rawUrl] of (archive.transcriptUrls || []).entries()) {
		const url = String(rawUrl || '').trim();
		if (!url || seen.has(url) || assets.length >= maximum) continue;
		seen.add(url);
		const language = String(languages[index] || '').trim();
		assets.push({
			type: 'document',
			role: 'caption',
			url,
			mime: mimeForUrl(url),
			title: language ? `${language} subtitles` : 'Subtitles'
		});
	}
	return assets;
}

module.exports = {
	MIME_BY_EXTENSION,
	captionAssets,
	mimeForUrl
};
