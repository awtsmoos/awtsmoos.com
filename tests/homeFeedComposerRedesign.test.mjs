// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HomeFeedComposerRedesignTest
 * @description
 * The Awtsmoos guards one original social river: real routes, generous mobile
 * width, and truthful composer actions remain joined throughout Awtsmoos.com.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '..');

function readSource(relativePath) {
	return fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

test('home keeps live feed contracts inside the richer social hierarchy', () => {
	const index = readSource('geelooy/index.html');
	for (const contract of [
		'data-home-dashboard-page',
		'data-home-feed-section',
		'id="home-feed"',
		'data-home-feed',
		'data-feed-mode="forYou"'
	]) {
		assert.ok(index.includes(contract), contract);
	}
	assert.ok(index.includes('class="home-stream-tabs"'));
	assert.ok(index.includes('class="home-circle-rail"'));
	assert.ok(index.includes('href="/games"'));
});

test('home loads the focused redesign after the existing feed system', () => {
	const manifest = readSource('geelooy/style/social/home/index.css');
	assert.ok(manifest.includes('./feed/index.css'));
	assert.ok(manifest.includes('./redesign/index.css'));
	assert.ok(
		manifest.indexOf('./redesign/index.css') > manifest.indexOf('./feed/index.css')
	);
});

test('compact creation actions enter the real full composer', () => {
	const actions = readSource(
		'geelooy/scripts/awtsmoos/social/feed/homeComposer/quickActions.js'
	);
	for (const label of ['Photo', 'Video', 'Live', 'Torah', 'Event']) {
		assert.ok(actions.includes(`'${label}'`), label);
	}
	assert.ok(actions.includes('href="/social-composer/"'));
});

test('phone posts and composer explicitly own the viewport edges', () => {
	const layout = readSource('geelooy/style/social/home/redesign/layout.css');
	const feed = readSource('geelooy/style/social/home/redesign/mobile.css');
	const composerManifest = readSource(
		'geelooy/style/geelooy-app/home/composer/social-surface.css'
	);
	const composerMobile = readSource(
		'geelooy/style/geelooy-app/home/composer/social-surface/mobile.css'
	);
	assert.ok(layout.includes('body.geelooy-home-document'));
	assert.ok(layout.includes('margin: 0'));
	assert.ok(feed.includes('inline-size: calc(100% + 1.3rem)'));
	assert.ok(feed.includes('.home-feed-section > .home-feed-list'));
	assert.ok(feed.includes('border-radius: 0'));
	assert.ok(composerManifest.includes('./social-surface/mobile.css'));
	assert.ok(composerMobile.includes('margin-inline: -.65rem'));
});
