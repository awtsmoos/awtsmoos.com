//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module LexiconPublicSourceIdentity
 * @description
 * Learners see functional dictionary names while exact scholarly provenance,
 * licensing, source URLs, and editions remain structured beneath each source.
 * BDB, Jastrow, and Yiddish keep separate identities inside one merged tool.
 */

const PUBLIC_TITLES = Object.freeze({
	bdb: 'Biblical Hebrew Dictionary',
	jastrow: 'Jastrow Aramaic Dictionary',
	'yiddish-wiktionary': 'Yiddish Dictionary'
});

/** Chooses a stable learner-facing title without erasing source identity. */
function functionalTitle(source = {}, id = '') {
	if (PUBLIC_TITLES[id]) return PUBLIC_TITLES[id];
	const language = String(source.language || '').trim();
	return language ? `${language} Dictionary` : 'Dictionary';
}

/** Projects one native source record into the safe public dictionary contract. */
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
			quality: source.quality || '',
			provider: source.provider || ''
		}
	};
}

module.exports = {
	PUBLIC_TITLES,
	functionalTitle,
	publicSource
};
