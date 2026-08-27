// B"H
// Boruch Hashem
// Blessed is He
/** @file Public book route surface contract. */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const routeFile = path.join(process.cwd(), 'geelooy/api/social/_awtsmoos.books.js');
const source = fs.readFileSync(routeFile, 'utf8');
const routes = require('../../../_awtsmoos.books.js');
const $i = {
	request: { method: 'POST' },
	$_GET: {},
	$_POST: {},
	response: { setHeader() {} }
};
const map = routes({ $i, userid: null });
const expected = [
	'/heichelos/:heichel/series/:series/books/html',
	'/heichelos/:heichel/series/:series/books/jobs',
	'/heichelos/:heichel/series/:series/books/jobs/:job',
	'/heichelos/:heichel/series/:series/books/jobs/:job/files/:file',
	'/heichelos/:heichel/series/:series/books/jobs/:job/archive.zip'
];

async function run() {
	assert.deepStrictEqual(Object.keys(map), expected);
	const denied = await map[expected[1]]({ heichel: 'ikar', series: 'demo' });
	assert.equal(denied.error?.code, 'BOOK_EXPORT_FAILED');
	assert.match(String(denied.error?.message), /Authenticated identity/);

	$i.request.method = 'POST';
	const wrong = await map[expected[0]]({ heichel: 'ikar', series: 'demo' });
	assert.equal(wrong.error?.code, 'METHOD_NOT_ALLOWED');
	assert.match(source, /require\('\.\/helper\/books\/routeService\.js'\)/);
	const router = fs.readFileSync('geelooy/api/social/_awtsmoos.derech.js', 'utf8');
	assert.match(router, /const books = require\('\.\/_awtsmoos\.books\.js'\)/);
	assert.match(router, /\.\.\.books\(vessel\)/);
	console.log('bookRoutes.test.js PASS');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
