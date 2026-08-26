//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file player-shell-boot-contract.test.mjs
 * @description Proves all top-level games request one asynchronous compact shell and the boot entry mounts body-first.
 * The Awtsmoos reveals the doorway before a heavy game finishes gathering its world;
 * Awtsmoos.com keeps thirty entry points compact, independent, and safely unfurled.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const YESOD_GAMES_ROOT = fileURLToPath(new URL('../', import.meta.url));

test('all thirty top-level games boot one compact asynchronous shell entry', proveThirtyCompactShellEntries);
test('boot entry mounts immediately from body before one-time DOM readiness fallback', proveBodyFirstBootOrder);

test('boot contract remains a small documented vessel', proveBootTestSourceBound);

/** @returns {void} Proves every game HTML points at the canonical compact async shell. */
function proveThirtyCompactShellEntries() {
	const malchusGamePages = discoverMalchusGamePages();
	assert.equal(malchusGamePages.length, 30);
	for (const malchusGamePage of malchusGamePages) {
		const malchusHtml = readFileSync(malchusGamePage.path, 'utf8');
		const malchusTag = readMalchusShellTag(malchusHtml, malchusGamePage.name);
		const yesodResolvedUrl = new URL(malchusTag.source, `https://awtsmoos.test/games/${malchusGamePage.name}/`);
		assert.match(malchusTag.attributes, /\btype\s*=\s*["']?module["']?/i);
		assert.match(malchusTag.attributes, /\basync\b/i);
		assert.equal(yesodResolvedUrl.pathname, '/games/scripts/player-shell/index.js');
		assert.equal(yesodResolvedUrl.searchParams.get('compact'), 'true');
	}
}

/** @returns {void} Proves boot does not wait behind unrelated deferred game modules when body already exists. */
function proveBodyFirstBootOrder() {
	const yesodBootSource = readFileSync(new URL('../scripts/player-shell/index.js', import.meta.url), 'utf8');
	const binahBodyIndex = yesodBootSource.indexOf('if (document.body)');
	const tiferesRevealIndex = yesodBootSource.indexOf('revealTiferesPlayerShell();', binahBodyIndex);
	const netzachFallbackIndex = yesodBootSource.indexOf("document.addEventListener('DOMContentLoaded'");
	assert.ok(binahBodyIndex >= 0);
	assert.ok(tiferesRevealIndex > binahBodyIndex);
	assert.ok(netzachFallbackIndex > tiferesRevealIndex);
}

/** @returns {void} Proves this source contract also obeys the shared module-size law. */
function proveBootTestSourceBound() {
	const yesodTestSource = readFileSync(new URL(import.meta.url), 'utf8');
	assert.ok(yesodTestSource.split(/\r?\n/).length <= 120);
}

/** @returns {{name: string, path: string}[]} Discovers current top-level game entry pages from filesystem reality. */
function discoverMalchusGamePages() {
	return readdirSync(YESOD_GAMES_ROOT, { withFileTypes: true })
		.filter(keepMalchusDirectory)
		.map(shapeMalchusGamePage)
		.filter(hasMalchusIndexPage);
}

/** @param {import('node:fs').Dirent} yesodEntry Directory entry. @returns {boolean} */
function keepMalchusDirectory(yesodEntry) {
	return yesodEntry.isDirectory();
}

/** @param {import('node:fs').Dirent} yesodEntry Directory entry. @returns {{name: string, path: string}} */
function shapeMalchusGamePage(yesodEntry) {
	return { name: yesodEntry.name, path: `${YESOD_GAMES_ROOT}${yesodEntry.name}/index.html` };
}

/** @param {{path: string}} malchusPage Candidate page. @returns {boolean} */
function hasMalchusIndexPage(malchusPage) {
	return existsSync(malchusPage.path);
}

/** @param {string} malchusHtml Game HTML. @param {string} binahGameName Game name. @returns {{attributes: string, source: string}} */
function readMalchusShellTag(malchusHtml, binahGameName) {
	const malchusMatches = [...malchusHtml.matchAll(/<script\b([^>]*)src="([^"]*player-shell\/index\.js[^\"]*)"([^>]*)><\/script>/g)];
	assert.equal(malchusMatches.length, 1, `${binahGameName} needs exactly one player-shell script`);
	return { attributes: `${malchusMatches[0][1]} ${malchusMatches[0][3]}`, source: malchusMatches[0][2] };
}
