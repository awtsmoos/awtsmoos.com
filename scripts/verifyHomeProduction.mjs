#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file verifyHomeProduction.mjs
 * @description
 * The Awtsmoos verifies the public shell, homepage hero, critical routes, Heichel fallback,
 * and one real Torah reader before any deployment may be called whole.
 */

import assert from 'node:assert';

const origin = process.env.AWTSMOOS_PUBLIC_ORIGIN || 'https://awtsmoos.com';
const heroPath = '/api/social/drive/public/awtsmoos/file_000000001aa071f5afcedcf09919246e.png';
const readerPath = '/heichelos/ikar/series/BH-likkuteiTorah-%D7%A9%D7%9C%D7%97/4';
const templateErrorMarkers = [
	'thereWasAnAwtsmoosErrorHere',
	'ReferenceError:',
	'Error processing code segment'
];

/**
 * Rejects any HTML response that exposes a server-side template failure to a reader.
 *
 * @param {string} html - Complete public HTML response.
 * @param {string} path - Public route whose response is being judged.
 * @returns {void}
 */
function assertNoTemplateLeak(html, path) {
	for (const marker of templateErrorMarkers) {
		assert(!html.includes(marker), `${path} leaked template error marker ${marker}`);
	}
}

const homepage = await getText('/');
assert(
	/<main\b[^>]*\bclass=["'][^"']*\bhome\b/.test(homepage),
	'public homepage missing semantic home main'
);
for (const token of [
	'data-profile-mount',
	'data-world-id="games"',
	'/api/social/drive/public/awtsmoos/file_000000001aa071f5afcedcf09919246e.png',
	'data-particle-sky',
	'/mawgawl/sefarim/',
	'/apps/tunnel-control/'
]) {
	assert(homepage.includes(token), `public homepage missing ${token}`);
}

const heichel = await getText('/heichelos/ikar');
assertNoTemplateLeak(heichel, '/heichelos/ikar');
assert(
	heichel.includes('data-heichel-semantic-fallback'),
	'public Heichel missing semantic server fallback'
);

const reader = await getText(readerPath);
assertNoTemplateLeak(reader, readerPath);
assert(
	reader.includes('data-awtsmoos-initial-post'),
	'public Torah reader missing immediate server-rendered teaching'
);

const image = await get(heroPath);
const bytes = new Uint8Array(await image.arrayBuffer());
assert.strictEqual(bytes.length, 3228450, 'public hero byte size changed');
assert(bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47, 'public hero is not PNG');

assert(
	/<link\b[^>]*\brel=["'](?:shortcut )?icon["']/.test(homepage),
	'public homepage missing icon link'
);

for (const path of [
	'/social-hub/',
	'/mawgawl/sefarim/',
	'/apps/',
	'/games/',
	'/apps/tunnel-control/',
	'/os',
	'/api/contact/status'
]) {
	await get(path);
}

console.log(JSON.stringify({
	ok: true,
	suite: 'home-production-contract',
	origin,
	readerPath,
	heroPath,
	heroBytes: bytes.length
}, null, 2));

/**
 * Fetches one public route and returns its complete response body as text.
 *
 * @param {string} path - Origin-relative path to retrieve.
 * @returns {Promise<string>} Complete response body.
 */
async function getText(path) {
	return (await get(path)).text();
}

/**
 * Fetches one public route with a bounded deadline and rejects non-success responses.
 *
 * @param {string} path - Origin-relative path to retrieve.
 * @returns {Promise<Response>} Successful public response.
 */
async function get(path) {
	const response = await fetch(new URL(path, origin), {
		redirect: 'follow',
		signal: AbortSignal.timeout(20000)
	});
	assert(response.ok, `${path} returned ${response.status}`);
	return response;
}
