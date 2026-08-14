// B"H
// Boruch Hashem
// Blessed is He
/** @file Direct printable HTML route and attachment response contract. */
const assert = require('assert');
const routes = require('../../../_awtsmoos.books.js');

const headers = {};
const $i = {
	request: { method: 'GET' },
	$_GET: { language: 'english', fontPt: '11.5' },
	$_POST: {},
	response: {
		statusCode: 0,
		setHeader(name, value) {
			headers[name] = String(value);
		}
	},
	async fetchAwtsmoos(url) {
		if (url.endsWith('/series/demo')) {
			return { id: 'demo', prateem: { name: 'Demo Volume' } };
		}
		if (url.endsWith('/series/demo/subSeries')) return [];
		if (url.endsWith('/series/demo/posts')) return ['p1'];
		if (url.endsWith('/series/demo/post/p1')) {
			return { id: 'p1', title: 'Demo Teaching', dayuh: { sections: [['מקור']] } };
		}
		if (url.endsWith('/series/demo/post/p1/translations')) {
			return {
				success: [{
					content: 'A translated teaching.',
					verseSection: '0',
					dayuh: { subSection: 1 }
				}]
			};
		}
		throw new Error(`Unexpected mock source URL: ${url}`);
	}
};

async function run() {
	const map = routes({ $i, userid: null });
	const result = await map['/heichelos/:heichel/series/:series/books/html']({
		heichel: 'ikar',
		series: 'demo'
	});
	assert.equal($i.response.statusCode, 200);
	assert.match(headers['Content-Type'], /text\/html/);
	assert.match(headers['Content-Disposition'], /attachment/);
	assert.ok(Buffer.isBuffer(result.response));
	const html = result.response.toString('utf8');
	assert.match(html, /^<!doctype html>/);
	assert.match(html, /A translated teaching\./);
	assert.doesNotMatch(html, /מקור/);
	assert.match(html, /size: 6in 9in/);
	console.log('bookDirectRoute.test.js PASS');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
