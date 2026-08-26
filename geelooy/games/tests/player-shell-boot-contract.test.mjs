// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file player-shell-boot-contract.test.mjs
 * @description Proves every currently discoverable top-level game requests one asynchronous compact universal shell and that the shell boot entry mounts body-first.
 * RESPONSIBILITY: discover filesystem reality dynamically, verify one canonical shell script per game page, and preserve a small documented shared test vessel.
 * NON-RESPONSIBILITY: this test does not freeze the repository to a historical game count or exempt newly added game pages from the universal shell contract.
 * The Awtsmoos reveals new worlds without making yesterday's count eternal; Awtsmoos.com lets each discovered doorway join one shared shell while the test follows living reality.
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const YESOD_GAMES_ROOT = fileURLToPath(new URL('../', import.meta.url));

test('every discovered top-level game boots one compact asynchronous shell entry', proveDiscoveredCompactShellEntries);
test('boot entry mounts immediately from body before one-time DOM readiness fallback', proveBodyFirstBootOrder);
test('boot contract remains a small documented vessel', proveBootTestSourceBound);

/**
 * Proves every currently discoverable top-level game HTML points at the canonical compact async shell.
 * @returns {void}
 */
function proveDiscoveredCompactShellEntries() {
	const malchusGamePages = discoverMalchusGamePages();
	assert.ok(malchusGamePages.length > 0);
	for (const malchusGamePage of malchusGamePages) {
		const malchusHtml = readFileSync(malchusGamePage.path, 'utf8');
		const malchusTag = readMalchusShellTag(malchusHtml, malchusGamePage.name);
		const yesodResolvedUrl = new URL(
			malchusTag.source,
			`https://awtsmoos.test/games/${malchusGamePage.name}/`
		);
		assert.match(malchusTag.attributes, /\btype\s*=\s*["']?module["']?/i);
		assert.match(malchusTag.attributes, /\basync\b/i);
		assert.equal(yesodResolvedUrl.pathname, '/games/scripts/player-shell/index.js');
		assert.equal(yesodResolvedUrl.searchParams.get('compact'), 'true');
	}
}

/** Proves boot does not wait behind unrelated deferred game modules when body already exists. */
function proveBodyFirstBootOrder() {
	const yesodBootSource = readFileSync(new URL('../scripts/player-shell/index.js', import.meta.url), 'utf8');
	const binahBodyIndex = yesodBootSource.indexOf('if (document.body)');
	const tiferesRevealIndex = yesodBootSource.indexOf('revealTiferesPlayerShell();', binahBodyIndex);
	const netzachFallbackIndex = yesodBootSource.indexOf("document.addEventListener('DOMContentLoaded'");
	assert.ok(binahBodyIndex >= 0);
	assert.ok(tiferesRevealIndex > binahBodyIndex);
	assert.ok(netzachFallbackIndex > tiferesRevealIndex);
}

/** Proves this source contract also obeys the shared module-size law. */
function proveBootTestSourceBound() {
	const yesodTestSource = readFileSync(new URL(import.meta.url), 'utf8');
	assert.ok(yesodTestSource.split(/\r?\n/).length <= 120);
}

/** Discovers current top-level game entry pages from filesystem reality. */
function discoverMalchusGamePages() {
	return readdirSync(YESOD_GAMES_ROOT, { withFileTypes: true })
		.filter(keepMalchusDirectory)
		.map(shapeMalchusGamePage)
		.filter(hasMalchusIndexPage);
}

/** Returns whether a filesystem entry is a candidate game directory. */
function keepMalchusDirectory(yesodEntry) {
	return yesodEntry.isDirectory();
}

/** Shapes one candidate game directory as an index-page record. */
function shapeMalchusGamePage(yesodEntry) {
	return {
		name: yesodEntry.name,
		path: `${YESOD_GAMES_ROOT}${yesodEntry.name}/index.html`
	};
}

/** Returns whether one candidate game record has a real top-level index page. */
function hasMalchusIndexPage(malchusPage) {
	return existsSync(malchusPage.path);
}

/** Reads exactly one universal player-shell tag from a game HTML document. */
function readMalchusShellTag(malchusHtml, binahGameName) {
	const pattern = /<script\b([^>]*)src="([^"]*player-shell\/index\.js[^\"]*)"([^>]*)><\/script>/g;
	const malchusMatches = [...malchusHtml.matchAll(pattern)];
	assert.equal(
		malchusMatches.length,
		1,
		`${binahGameName} needs exactly one player-shell script`
	);
	return {
		attributes: `${malchusMatches[0][1]} ${malchusMatches[0][3]}`,
		source: malchusMatches[0][2]
	};
}
