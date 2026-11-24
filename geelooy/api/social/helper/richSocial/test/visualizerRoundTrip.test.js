//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RichSocialVisualizerRoundTripTest
 * @description
 * The Awtsmoos lets an author clothe a melody in light; Awtsmoos.com proves
 * the chosen audio visualizer survives the exact server normalization a
 * published post passes through — root assets and section assets alike —
 * while unlisted presets, executable strings, and visualizers attached to
 * non-audio media are stripped. This guards the composer → payload →
 * storage → reader chain (reader: PostManifestElements passes
 * asset.visualizer to attachAudioEffects as its initial mode).
 */

const assert = require('assert');
const {
	normalizeAttachments,
	normalizeRichPost
} = require('../index.js');

const audioAsset = visualizer => ({
	id: 'song-1',
	type: 'audio',
	mime: 'audio/mpeg',
	publicPath: '/media/song-1.mp3',
	visualizer
});

// Allowed presets survive attachment normalization.
for (const preset of ['waveform', 'spectrum', 'celestial']) {
	const [kept] = normalizeAttachments([audioAsset(preset)]);
	assert.equal(kept.visualizer, preset, `preset ${preset} must survive`);
}

// Unlisted or executable values never survive.
for (const hostile of ['evil', '<script>alert(1)</script>', 'waveform;evil', 42, null]) {
	const [stripped] = normalizeAttachments([audioAsset(hostile)]);
	assert.equal(stripped.visualizer, undefined, `hostile visualizer ${String(hostile)} must be stripped`);
}

// A visualizer on non-audio media is stripped.
const [image] = normalizeAttachments([{
	id: 'cover-1',
	type: 'image',
	mime: 'image/png',
	publicPath: '/media/cover-1.png',
	visualizer: 'celestial'
}]);
assert.equal(image.visualizer, undefined, 'visualizer must not attach to images');

// The full post normalization (the publication storage shape) preserves it
// on root assets and on section assets.
const post = normalizeRichPost({
	aliasId: 'coby',
	heichelId: 'ohrHaNiggun',
	seriesId: 'echoesOfTheInfinite',
	title: 'Round trip',
	content: 'A melody',
	rootAssets: [audioAsset('celestial')],
	sections: [{ title: 'Verse', assets: [audioAsset('waveform')] }]
});
assert.equal(post.rootAssets[0].visualizer, 'celestial', 'root asset visualizer must survive normalizeRichPost');
const sectionAssets = (post.sections || []).flatMap(section => section.assets || []);
assert.equal(sectionAssets[0].visualizer, 'waveform', 'section asset visualizer must survive normalizeRichPost');

console.log('B"H richSocial visualizerRoundTrip.test passed');
