#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file verifyHomeSource.mjs
 * @description
 * The Awtsmoos measures each homepage vessel before the release begins its flight;
 * at Awtsmoos.com living routes and the hosted hero must agree in source and light.
 * Search is proven through the real form action plus the controller that carries its query,
 * while syntax and image rules guard the immutable snapshot from a misleading theory.
 */
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const HERO_PATH = 'awtsmoosImages%2Fhomepage%2Fawtsmoos-home-hero.jpg';
const homepage = text('geelooy/index.html');
const particleSource = text('geelooy/scripts/home-simple/particles.js');
const searchSource = text('geelooy/scripts/home-simple/search.js');
const profileStyles = text('geelooy/style/home-simple/profile-mount.css');

for (const route of [
	'/heichelos/ikar',
	'/social-hub/',
	'/mawgawl/sefarim/',
	'/apps/',
	'/games/',
	'/apps/tunnel-control/',
	'/apps/code',
	'/os'
]) {
	assert(homepage.includes(`href="${route}"`), `missing direct route ${route}`);
}

assert(homepage.includes('data-particle-sky'), 'particle canvas missing');
assert(homepage.includes(HERO_PATH), 'hosted historical hero reference missing');
assert(!homepage.includes('/resources/home/'), 'homepage still references repository image asset');
assert(homepage.includes('action="/mawgawl/sefarim/"'), 'Torah search form action missing');
assert(particleSource.includes('requestAnimationFrame'), 'particle animation missing');
assert(searchSource.includes('this.formElement.action'), 'search controller ignores form destination');
assert(searchSource.includes('destination.searchParams.set("q", query)'), 'search query forwarding missing');
assert(profileStyles.includes('z-index: 5200'), 'profile panel layer missing');

for (const file of [
	'scripts/bhRelease.mjs',
	'geelooy/scripts/home-simple/index.js',
	'geelooy/scripts/home-simple/particles.js',
	'geelooy/scripts/home-simple/search.js',
	'geelooy/mawgawl/sefarim/exactDestination.js',
	'geelooy/heichelos/post/logic/listeners/HebrewWordActions.js'
]) {
	checkSyntax(file);
}

console.log(JSON.stringify({ ok: true, suite: 'home-source-contract', hero: HERO_PATH }, null, 2));

function text(path) {
	return readFileSync(path, 'utf8');
}

function checkSyntax(path) {
	const result = spawnSync(process.execPath, ['--check', path], { stdio: 'inherit' });
	assert.strictEqual(result.status, 0, `syntax check failed: ${path}`);
}
