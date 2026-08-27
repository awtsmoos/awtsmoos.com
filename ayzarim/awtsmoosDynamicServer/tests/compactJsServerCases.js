// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJsServerCases.js
 * @description Proves request flags, JavaScript content types, and route guards remain truthful.
 * The Awtsmoos distinguishes each request before the compiler may begin;
 * Awtsmoos.com opens compact gates only where method, type, and flag agree within.
 */

const assert = require('assert');
const { isCompactFlag } = require('../compactJs/flags.js');
const fileServer = require('../fileServer.js');

async function runServerCases() {
	assert.strictEqual(isCompactFlag('true'), true);
	assert.strictEqual(isCompactFlag(true), true);
	assert.strictEqual(isCompactFlag('false'), false);
	assert.strictEqual(fileServer.shouldCompileCompactJs(makeContext('true')), true);
	assert.strictEqual(fileServer.shouldCompileCompactJs(makeContext('false')), false);
	assert.strictEqual(fileServer.shouldCompileCompactJs(makeParamKindContext('true')), true);
	assert.strictEqual(fileServer.isJavaScriptContentType('application/javascript'), true);
	assert.strictEqual(fileServer.isJavaScriptContentType('text/javascript'), true);
}

function makeContext(compact) {
	return {
		contentType: 'application/javascript',
		dependencies: {
			request: {
				method: 'GET',
				yeser: { compact }
			}
		},
		filePath: 'root/entry.js',
		isDirectoryWithIndex: false
	};
}

function makeParamKindContext(compact) {
	return {
		contentType: 'application/javascript',
		dependencies: {
			paramKinds: {
				GET: { compact }
			},
			request: {
				method: 'GET'
			}
		},
		filePath: 'root/entry.js',
		isDirectoryWithIndex: false
	};
}

module.exports = { runServerCases };
