// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Unicode book-download header contract.
 * @description The Awtsmoos lets every holy tongue keep its true name while HTTP receives a lawful ASCII vessel.
 */
const assert = require('assert');
const {
	asciiFileName,
	contentDisposition,
	headers
} = require('../download.js');

const fileName = '005-Meluket-Shevat-שבט_meluket.html';

function assertAscii(value) {
	for (const character of value) {
		assert.ok(character.charCodeAt(0) <= 0x7F, `Non-ASCII header character: ${character}`);
	}
}

function mockRequestVessel() {
	const captured = {};
	return {
		captured,
		$i: {
			response: {
				statusCode: 0,
				setHeader(name, value) {
					assertAscii(String(value));
					captured[name] = String(value);
				}
			}
		}
	};
}

function run() {
	const fallback = asciiFileName(fileName);
	assert.match(fallback, /^005-Meluket-Shevat-/);
	assert.match(fallback, /_meluket\.html$/);
	assert.doesNotMatch(fallback, /[\u0590-\u05FF]/);

	const disposition = contentDisposition(fileName);
	assertAscii(disposition);
	assert.match(disposition, /^attachment; filename="/);
	assert.match(disposition, /filename\*=UTF-8''/);
	assert.match(disposition, /%D7%A9%D7%91%D7%98/);
	assert.doesNotMatch(disposition, /שבט/);

	const vessel = mockRequestVessel();
	headers(vessel.$i, 'text/html; charset=utf-8', fileName, 1234);
	assert.equal(vessel.$i.response.statusCode, 200);
	assert.equal(vessel.captured['Content-Length'], '1234');
	assert.equal(vessel.captured['Content-Disposition'], disposition);

	const hostile = contentDisposition('bad\r\n"name\\שבט.html');
	assertAscii(hostile);
	assert.doesNotMatch(hostile, /\r|\n/);
	console.log('bookUnicodeDownload.test.js PASS');
}

run();
