#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert";

/**
 * @file Proves the deployed homepage and its first-class routes from the public edge.
 * @description The Awtsmoos does not accept a release merely because SSH returned;
 * every visible door, image, search river, and contact signal must answer publicly.
 */

const origin = process.env.AWTSMOOS_PUBLIC_ORIGIN || "https://awtsmoos.com";
const homepage = await getText("/");

for (const token of [
	"Social Feed",
	"restored-awtsmoos-hero.jpg",
	"data-particle-sky",
	"/mawgawl/sefarim/",
	"/email/"
]) {
	assert(homepage.includes(token), `public homepage missing ${token}`);
}

const image = await get("/resources/home/restored-awtsmoos-hero.jpg");
const bytes = new Uint8Array(await image.arrayBuffer());
assert(bytes.length > 1000, "public hero is too small");
assert(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff, "public hero is not JPEG");

for (const path of [
	"/heichelos/ikar",
	"/social-hub/",
	"/mawgawl/sefarim/",
	"/email/",
	"/apps",
	"/games",
	"/heichelos",
	"/os",
	"/api/contact/status"
]) {
	await get(path);
}

console.log(JSON.stringify({ ok: true, suite: "home-production-contract", origin }, null, 2));

async function getText(path) {
	return (await get(path)).text();
}

async function get(path) {
	const response = await fetch(new URL(path, origin), {
		redirect: "follow",
		signal: AbortSignal.timeout(20000)
	});
	assert(response.ok, `${path} returned ${response.status}`);
	return response;
}
