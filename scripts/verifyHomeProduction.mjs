#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file verifyHomeProduction.mjs
 * @description
 * The Awtsmoos verifies living public meaning instead of fossilized byte counts;
 * Awtsmoos.com may optimize an image vessel while its visible dimensions and truth remain whole.
 */

import assert from 'node:assert';

const origin = process.env.AWTSMOOS_PUBLIC_ORIGIN || 'https://awtsmoos.com';
const heroPath = '/api/social/drive/public/awtsmoos/file_000000001aa071f5afcedcf09919246e.png';
const readerPath = '/heichelos/ikar/series/BH-likkuteiTorah-%D7%A9%D7%9C%D7%97/4';
const templateErrorMarkers = ['thereWasAnAwtsmoosErrorHere', 'ReferenceError:', 'Error processing code segment'];

function assertNoTemplateLeak(html, routePath) {
	for (const marker of templateErrorMarkers) {
		assert(!html.includes(marker), `${routePath} leaked template error marker ${marker}`);
	}
}

function jpegDimensions(bytes) {
	for (let offset = 2; offset + 9 < bytes.length;) {
		if (bytes[offset] !== 0xff) {
			offset += 1;
			continue;
		}
		while (bytes[offset] === 0xff) offset += 1;
		const marker = bytes[offset++];
		if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
		const length = (bytes[offset] << 8) | bytes[offset + 1];
		if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
			return { height: (bytes[offset + 3] << 8) | bytes[offset + 4], width: (bytes[offset + 5] << 8) | bytes[offset + 6] };
		}
		offset += length;
	}
	return null;
}

function imageFacts(bytes) {
	if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
		return {
			type: 'png',
			width: (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19],
			height: (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23]
		};
	}
	if (bytes[0] === 0xff && bytes[1] === 0xd8) return { type: 'jpeg', ...jpegDimensions(bytes) };
	return null;
}

const homepage = await getText('/');
assert(/<main\b[^>]*\bclass=["'][^"']*\bhome\b/.test(homepage), 'public homepage missing semantic home main');
for (const token of ['data-profile-mount', 'data-world-id="games"', heroPath, 'data-particle-sky', '/mawgawl/sefarim/', '/apps/tunnel-control/']) {
	assert(homepage.includes(token), `public homepage missing ${token}`);
}

const heichel = await getText('/heichelos/ikar');
assertNoTemplateLeak(heichel, '/heichelos/ikar');
assert(heichel.includes('data-heichel-semantic-fallback'), 'public Heichel missing semantic server fallback');

const reader = await getText(readerPath);
assertNoTemplateLeak(reader, readerPath);
assert(reader.includes('data-awtsmoos-initial-post'), 'public Torah reader missing immediate server-rendered teaching');

const image = await get(heroPath);
const bytes = new Uint8Array(await image.arrayBuffer());
const facts = imageFacts(bytes);
assert(image.headers.get('content-type')?.startsWith('image/'), 'public hero content-type is not an image');
assert(bytes.length >= 32768, `public hero payload is unexpectedly small: ${bytes.length}`);
assert(facts?.width >= 256 && facts?.height >= 256, 'public hero is not a valid large JPEG/PNG image');

assert(/<link\b[^>]*\brel=["'](?:shortcut )?icon["']/.test(homepage), 'public homepage missing icon link');
for (const routePath of ['/social-hub/', '/mawgawl/sefarim/', '/apps/', '/games/', '/apps/tunnel-control/', '/os', '/api/contact/status']) await get(routePath);

console.log(JSON.stringify({
	ok: true,
	suite: 'home-production-contract',
	origin,
	readerPath,
	heroPath,
	heroBytes: bytes.length,
	heroType: facts.type,
	heroWidth: facts.width,
	heroHeight: facts.height
}, null, 2));

async function getText(routePath) {
	return (await get(routePath)).text();
}

async function get(routePath) {
	const response = await fetch(new URL(routePath, origin), { redirect: 'follow', signal: AbortSignal.timeout(20000) });
	assert(response.ok, `${routePath} returned ${response.status}`);
	return response;
}
