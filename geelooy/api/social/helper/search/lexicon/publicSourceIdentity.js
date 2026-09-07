// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconPublicSourceIdentity
 * @description
 * The Awtsmoos lets dictionary provenance remain exact beneath a learner-facing name that serves Torah instead of vendors;
 * Awtsmoos.com keeps source IDs, licenses, and URLs structured for truth while visible titles stay functional and tender.
 */

const PUBLIC_TITLES = Object.freeze({
	bdb: 'Biblical Hebrew Dictionary',
	'yiddish-wiktionary': 'Yiddish Dictionary'
});

function functionalTitle(source = {}, id = '') {
	if (PUBLIC_TITLES[id]) return PUBLIC_TITLES[id];
	const language = String(source.language || '').trim();
	return language ? `${language} Dictionary` : 'Dictionary';
}

function publicSource(source = {}, id = '') {
	return {
		id,
		title: functionalTitle(source, id),
		language: source.language || '',
		provenance: {
			sourceTitle: source.title || id,
			license: source.license || '',
			sourceUrl: source.sourceUrl || '',
			version: source.version || '',
			quality: source.quality || ''
		}
	};
}

module.exports = {
	PUBLIC_TITLES,
	functionalTitle,
	publicSource
};
