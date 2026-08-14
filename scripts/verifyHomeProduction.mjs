#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file verifyHomeProduction.mjs
 * @description
 * The Awtsmoos does not bind release truth to one changing marketing sentence;
 * Awtsmoos.com production must instead reveal its living shell, historical hero,
 * first-class routes, and exact public asset bytes before publication is called whole.
 */
import assert from 'node:assert';

const origin = process.env.AWTSMOOS_PUBLIC_ORIGIN || 'https://awtsmoos.com';
const heroPath = '/api/social/aliases/abarbanel/fileSystem/readFile?path=awtsmoosImages%2Fhomepage%2Fawtsmoos-home-hero.jpg';
const homepage = await getText('/');

for (const token of [
	'<main class="home">',
	'data-profile-mount',
	'data-world-id="games"',
	'awtsmoosImages%2Fhomepage%2Fawtsmoos-home-hero.jpg',
	'data-particle-sky',
	'/mawgawl/sefarim/',
	'/apps/tunnel-control/'
]) {
	assert(homepage.includes(token), `public homepage missing ${token}`);
}

const image = await get(heroPath);
const bytes = new Uint8Array(await image.arrayBuffer());
assert.strictEqual(bytes.length, 225056, 'public historical hero byte size changed');
assert(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff, 'public hero is not JPEG');

for (const path of [
	'/heichelos/ikar',
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
	heroPath,
	heroBytes: bytes.length
}, null, 2));

async function getText(path) {
	return (await get(path)).text();
}

async function get(path) {
	const response = await fetch(new URL(path, origin), {
		redirect: 'follow',
		signal: AbortSignal.timeout(20000)
	});
	assert(response.ok, `${path} returned ${response.status}`);
	return response;
}
