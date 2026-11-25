// B"H — Series player playlist contract: behavior preserved from the
// original single-file player (media field outranks root assets, video
// outranks audio, text-only posts are skipped, root series never plays).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./series-player/playlist.js', import.meta.url), 'utf8');
const sandbox = { window: {}, URL, console };
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const P = sandbox.window.AwtSeriesPlaylist;
// Values built inside the vm realm carry that realm's prototypes; compare
// structure through JSON instead of reference-strict deepEqual.
const J = v => JSON.parse(JSON.stringify(v));
const ORIGIN = 'https://awtsmoos.com';

test('seriesLocation parses series URLs and rejects root/non-series', () => {
	assert.deepEqual(J(P.seriesLocation('/heichelos/ohrHaNiggun/series/echoesOfTheInfinite')),
		{ heichelId: 'ohrHaNiggun', seriesId: 'echoesOfTheInfinite' });
	assert.equal(P.seriesLocation('/heichelos/ohrHaNiggun/series/root'), null);
	assert.equal(P.seriesLocation('/heichelos/ohrHaNiggun'), null);
	assert.equal(P.seriesLocation('/social/'), null);
});

test('kindOf reads type fields first, then URL extensions', () => {
	assert.equal(P.kindOf({ type: 'audio/mpeg', url: '/x.mp4' }), 'audio');
	assert.equal(P.kindOf({ url: '/media/song.mp3?v=1' }), 'audio');
	assert.equal(P.kindOf({ url: '/media/clip.webm' }), 'video');
	assert.equal(P.kindOf({ url: '/media/doc.pdf' }), '');
	assert.equal(P.kindOf(null), '');
});

test('buildPlaylist: media field outranks assets, video outranks audio, text skipped', () => {
	const posts = [
		{ id: 'a', title: 'Song', media: { audio: { url: '/a.mp3' }, video: { url: '/a.mp4' } } },
		{ id: 'b', title: 'Track', rootAssets: [{ url: '/b.wav' }] },
		{ id: 'c', title: 'Essay', rootAssets: [{ url: '/c.pdf' }] },
		{ post: { id: 'd', name: 'Wrapped', assets: [{ type: 'audio', url: '/d.m4a' }] } },
		{ id: 'e', title: 'External', media: { audio: { url: 'javascript:alert(1)' } } },
	];
	const list = P.buildPlaylist(posts, ORIGIN);
	assert.deepEqual(J(list.map(t => [t.id, t.kind])), [['a', 'video'], ['b', 'audio'], ['d', 'audio']]);
	assert.equal(list[0].url, 'https://awtsmoos.com/a.mp4');
	assert.equal(list[2].title, 'Wrapped');
});

test('buildPlaylist carries the author visualizer preset of the winning asset', () => {
	const posts = [
		{ id: 'a', title: 'Song', rootAssets: [{ url: '/a.mp3', visualizer: 'celestial' }] },
		{ id: 'b', title: 'Track', rootAssets: [{ url: '/b.mp3', visualizer: 'bogus' }] },
		{ id: 'c', title: 'Clip', media: { video: { url: '/c.mp4', visualizer: 'waveform' } } },
	];
	const list = P.buildPlaylist(posts, ORIGIN);
	assert.deepEqual(J(list.map(t => t.visualizer)), ['celestial', '', 'waveform']);
});

test('nextOnEnded: autoplay, repeat-track, repeat-series, and rest', () => {
	const natural = [0, 1, 2];
	assert.equal(P.nextOnEnded(0, 3, { autoplayNext: true, repeat: 'off', order: natural }), 1);
	assert.equal(P.nextOnEnded(2, 3, { autoplayNext: true, repeat: 'off', order: natural }), -1);
	assert.equal(P.nextOnEnded(0, 3, { autoplayNext: false, repeat: 'off', order: natural }), -1);
	assert.equal(P.nextOnEnded(1, 3, { autoplayNext: false, repeat: 'track', order: natural }), 1);
	assert.equal(P.nextOnEnded(2, 3, { autoplayNext: true, repeat: 'series', order: natural }), 0);
	assert.equal(P.nextOnEnded(2, 3, { autoplayNext: false, repeat: 'series', order: natural }), 0);
	assert.equal(P.nextOnEnded(0, 0, { autoplayNext: true, repeat: 'off', order: [] }), -1);
	const shuffled = [2, 0, 1];
	assert.equal(P.nextOnEnded(2, 3, { autoplayNext: true, repeat: 'off', order: shuffled }), 0);
	assert.equal(P.nextOnEnded(1, 3, { autoplayNext: true, repeat: 'off', order: shuffled }), -1);
});

test('shuffledOrder is a permutation that starts with the current track', () => {
	const order = P.shuffledOrder(6, 3, () => 0.42);
	assert.deepEqual(J([...order].sort((a, b) => a - b)), [0, 1, 2, 3, 4, 5]);
	assert.equal(order[0], 3);
	assert.deepEqual(J(P.naturalOrder(3)), [0, 1, 2]);
});

test('extractPosts unwraps success/posts/details/object-map shapes', () => {
	assert.deepEqual(J(P.extractPosts({ success: [{ id: 1 }] })), [{ id: 1 }]);
	assert.deepEqual(J(P.extractPosts({ posts: [{ id: 2 }] })), [{ id: 2 }]);
	assert.deepEqual(J(P.extractPosts({ details: [{ id: 3 }] })), [{ id: 3 }]);
	assert.deepEqual(J(P.extractPosts({ x: { id: 4 }, y: 5 })), [{ id: 4 }]);
	assert.deepEqual(J(P.extractPosts(null)), []);
});
