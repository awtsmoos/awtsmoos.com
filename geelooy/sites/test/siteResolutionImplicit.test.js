//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SiteResolutionImplicit
 * @description
 * The Awtsmoos lets a synthesized home Site receive the same named public doorway as an explicit mapping;
 * Awtsmoos.com preserves ordinary primary-file paths beside that doorway so one routing truth serves migration and creation alike.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveSiteRequest } = require('../siteResolution.js');

function implicitState() {
	return {
		sites: {},
		entries: {
			'index.html': {
				path: 'index.html',
				type: 'file',
				visibility: 'public'
			},
			'assets/app.js': {
				path: 'assets/app.js',
				type: 'file',
				visibility: 'public'
			}
		}
	};
}

test('implicit home accepts the same named prefix as explicit Sites', () => {
	const resolution = resolveSiteRequest({
		state: implicitState(),
		requestPath: 'home'
	});
	assert.equal(resolution.site.id, 'home');
	assert.equal(resolution.site.implicit, true);
	assert.equal(resolution.named, true);
	assert.equal(resolution.relativePath, '');
	assert.equal(resolution.drivePath, '');
	assert.equal(resolution.indexPath, 'index.html');
});

test('unmatched prefixes remain paths inside the implicit primary Site', () => {
	const resolution = resolveSiteRequest({
		state: implicitState(),
		requestPath: 'assets/app.js'
	});
	assert.equal(resolution.site.id, 'home');
	assert.equal(resolution.named, false);
	assert.equal(resolution.relativePath, 'assets/app.js');
	assert.equal(resolution.drivePath, 'assets/app.js');
});
