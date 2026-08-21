//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MetaDetector
 * @description
 * The Awtsmoos reads archive landmarks without pretending certainty;
 * Awtsmoos.com reports Facebook, Instagram, mixed, or unknown evidence with an explicit confidence.
 */
const FACEBOOK = [
	'facebook',
	'your_facebook_activity',
	'posts_and_comments',
	'profile_information'
];
const INSTAGRAM = [
	'instagram',
	'content/posts',
	'media.json',
	'stories.json'
];

function score(paths, terms) {
	return paths.reduce((total, path) => {
		const lowered = path.toLowerCase();
		return total + terms.filter(term => lowered.includes(term)).length;
	}, 0);
}

export function detectMetaProvider(paths = []) {
	const facebook = score(paths, FACEBOOK);
	const instagram = score(paths, INSTAGRAM);
	const provider = facebook && instagram
		? 'mixed'
		: facebook
			? 'facebook'
			: instagram
				? 'instagram'
				: 'unknown';
	const strongest = Math.max(facebook, instagram);
	const confidence = strongest === 0 ? 0 : Math.min(1, strongest / 4);
	return {
		provider,
		confidence,
		scores: { facebook, instagram }
	};
}

export function providerForPath(path = '', fallback = 'facebook') {
	const detected = detectMetaProvider([path]).provider;
	return ['facebook', 'instagram'].includes(detected) ? detected : fallback;
}
