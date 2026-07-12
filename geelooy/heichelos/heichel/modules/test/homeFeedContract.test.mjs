// B"H
/**
 * Verifies the home feed is API-backed, feed-first, and never padded with fake
 * demo posts when the live river is quiet.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function read(file) {
	return readFileSync(file, 'utf8');
}

function cssGraph(entry, seen = new Set()) {
	const normalized = path.normalize(entry).replace(/\\/g, '/');
	if (seen.has(normalized)) return '';
	seen.add(normalized);
	const source = read(normalized);
	const directory = path.dirname(normalized);
	const imported = [...source.matchAll(/@import\s+(?:url\()?['"]([^'")]+)['"]/g)]
		.map(match => match[1])
		.filter(target => target.startsWith('.'))
		.map(target => cssGraph(path.join(directory, target), seen))
		.join('\n');
	return `${source}\n${imported}`;
}

const html = read('geelooy/index.html');
const css = cssGraph('geelooy/style/geelooy-app/index.css');
const liveEntry = read('geelooy/scripts/awtsmoos/social/home/liveFeed.js');
const controller = read('geelooy/scripts/awtsmoos/social/home/live-feed/controller.js');

for (const token of ['g-home', 'g-home-hero', 'g-feed', 'home-feed-tabs', 'home-post-card', '/heichelos/submit']) {
	assert.ok(html.includes(token), `home html missing ${token}`);
}
for (const token of ['data-feed-mode="forYou"', 'data-feed-mode="following"', 'data-feed-mode="trending"', 'data-home-feed', 'liveFeed.js']) {
	assert.ok(html.includes(token), `home html missing live token ${token}`);
}
for (const forbidden of ['Awtsmoos Network</strong>', 'Every sunrise is a new song', 'sampleCollegeFeed', 'seedCollegeFeed']) {
	assert.ok(!html.includes(forbidden) && !controller.includes(forbidden), `home must not contain fake feed token ${forbidden}`);
}
for (const token of ['.g-home', '.g-home-hero', '.g-feed', '.home-post-card', '.g-dock']) {
	assert.ok(css.includes(token), `unified home CSS missing ${token}`);
}
for (const token of ['getFeedHome', 'getTrendingFeed', 'getDiscoverFeed', 'data-home-feed']) {
	assert.ok(liveEntry.includes(token), `live feed entry missing ${token}`);
}
for (const token of ['loadFeedMode', 'fetchIkarPosts', 'Promise.allSettled', "feed.dataset.infiniteFeed = 'real-api'"]) {
	assert.ok(controller.includes(token), `real feed controller missing ${token}`);
}
console.log('B"H homeFeedContract.test passed');
