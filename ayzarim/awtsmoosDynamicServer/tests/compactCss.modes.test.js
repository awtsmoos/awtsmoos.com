// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactCss.modes.test.js
 * @description Proves the shared compact query opens only the correct JavaScript or CSS representation gate.
 * The Awtsmoos gives one query flag two truthful vessels without confusing their type or path;
 * Awtsmoos.com lets CSS and JavaScript compact only on explicit GET requests while ordinary static delivery stays intact.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const modes = require('../static/FileResponseModes.js');

function context({
	compact = 'true',
	contentType = 'text/css',
	filePath = 'root/styles.css',
	method = 'GET',
	paramKinds = false
} = {}) {
	const request = { method };
	const dependencies = { request };
	if (paramKinds) {
		dependencies.paramKinds = { GET: { compact } };
	} else {
		request.yeser = { compact };
	}
	return {
		contentType,
		dependencies,
		filePath,
		isBinary: false,
		isDirectoryWithIndex: false
	};
}

test('B"H CSS compact mode accepts both request parameter vessels', () => {
	assert.equal(modes.shouldCompileCompactCss(context()), true);
	assert.equal(modes.shouldCompileCompactCss(context({ paramKinds: true })), true);
	assert.equal(modes.isCssContentType('text/css'), true);
});

test('B"H CSS compact mode rejects false flags, non-GET methods, wrong MIME, and wrong extension', () => {
	assert.equal(modes.shouldCompileCompactCss(context({ compact: 'false' })), false);
	assert.equal(modes.shouldCompileCompactCss(context({ method: 'HEAD' })), false);
	assert.equal(modes.shouldCompileCompactCss(context({ contentType: 'text/plain' })), false);
	assert.equal(modes.shouldCompileCompactCss(context({ filePath: 'root/styles.js' })), false);
});

test('B"H existing CompactJS mode remains available beside CompactCSS', () => {
	const jsContext = context({
		contentType: 'application/javascript',
		filePath: 'root/app.js'
	});
	assert.equal(modes.shouldCompileCompactJs(jsContext), true);
	assert.equal(modes.shouldCompileCompactCss(jsContext), false);
	assert.equal(modes.isJavaScriptContentType('application/javascript'), true);
	assert.equal(modes.isJavaScriptContentType('text/javascript'), true);
});
