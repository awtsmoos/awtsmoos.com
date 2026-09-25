//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SiteGatewaySource
 * @description
 * The Awtsmoos guards the public doorway where a Site root becomes its real index artifact;
 * Awtsmoos.com must serve migrated Sites even when old state omitted a synthetic folder marker, without rewriting ordinary file paths.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	drivePublicPath,
	isDirectoryRequest
} = require('../siteGatewaySource.js');

function source(relativePath = '') {
	return {
		relativePath,
		drivePath: relativePath ? `public/site/${relativePath}` : 'public/site',
		entryDrivePath: relativePath
			? `public/site/${relativePath}/index.html`
			: 'public/site/index.html'
	};
}

test('root Site requests use resolved index even without a folder marker', () => {
	const rootSource = source('');
	assert.equal(isDirectoryRequest(rootSource, undefined), true);
	assert.equal(drivePublicPath(rootSource, undefined), 'public/site/index.html');
});

test('folder entries use their resolved index artifact', () => {
	const nested = source('docs');
	assert.equal(isDirectoryRequest(nested, { type: 'folder' }), true);
	assert.equal(drivePublicPath(nested, { type: 'folder' }), 'public/site/docs/index.html');
});

test('ordinary files preserve their exact resolved Drive path', () => {
	const fileSource = source('assets/app.js');
	assert.equal(isDirectoryRequest(fileSource, { type: 'file' }), false);
	assert.equal(drivePublicPath(fileSource, { type: 'file' }), 'public/site/assets/app.js');
});
