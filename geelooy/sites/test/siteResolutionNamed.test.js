//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves explicit named gardens never erase the old alias road;
 * Awtsmoos.com keeps disabled names closed and primary roots confined.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	resolveSiteRequest,
	namedSitePath,
	primarySitePath
} = require('../siteResolution.js');

function mapping(id, rootPath, options = {}) {
	return {
		id,
		rootPath,
		enabled: options.enabled !== false,
		primary: options.primary === true
	};
}

test('implicit home never steals an ordinary legacy home path', () => {
	const result = resolveSiteRequest({
		requestPath: 'home/page.html',
		state: {}
	});
	assert.equal(result.named, false);
	assert.equal(result.mapping.id, 'home');
	assert.equal(result.drivePath, 'home/page.html');
});

test('explicit enabled id claims its named path', () => {
	const state = {
		sites: {
			main: mapping('main', 'www', { primary: true }),
			docs: mapping('docs', 'manual')
		}
	};
	const result = resolveSiteRequest({ requestPath: 'docs/guide.html', state });
	assert.equal(result.named, true);
	assert.equal(result.mapping.id, 'docs');
	assert.equal(result.drivePath, 'manual/guide.html');
});

test('disabled explicit id fails closed instead of using primary', () => {
	const state = {
		sites: {
			main: mapping('main', 'www', { primary: true }),
			docs: mapping('docs', 'manual', { enabled: false })
		}
	};
	const result = resolveSiteRequest({ requestPath: 'docs/guide.html', state });
	assert.equal(result.blocked, true);
	assert.equal(result.mapping.id, 'docs');
	assert.equal(result.drivePath, null);
});

test('unknown first segment remains an ordinary path under primary', () => {
	const state = {
		sites: {
			main: mapping('main', 'www', { primary: true })
		}
	};
	const result = resolveSiteRequest({ requestPath: 'assets/app.js', state });
	assert.equal(result.named, false);
	assert.equal(result.drivePath, 'www/assets/app.js');
});

test('public path helpers encode identity safely', () => {
	assert.equal(namedSitePath('a b', 'docs v2'), '/sites/a%20b/docs%20v2/');
	assert.equal(primarySitePath('a b'), '/sites/a%20b/');
});
