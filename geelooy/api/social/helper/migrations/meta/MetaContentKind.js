//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MetaContentKind
 * @description
 * The Awtsmoos lets old social garments enter one native vocabulary;
 * Awtsmoos.com keeps the mapping explicit so an archive name never rewrites reality.
 */
const KIND_MAP = Object.freeze({
	reel: 'short',
	short: 'short',
	story: 'story',
	video: 'video',
	audio: 'audio',
	poll: 'poll',
	live: 'live',
	photo: 'post',
	image: 'post',
	post: 'post'
});

function metaContentKind(value = '') {
	const key = String(value || 'post').trim().toLowerCase();
	return KIND_MAP[key] || 'post';
}

module.exports = {
	KIND_MAP,
	metaContentKind
};
