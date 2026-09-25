// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file player-shell-boot-contract.test.mjs
 * @description Proves every discovered shell-required route requests one compact asynchronous universal shell while study doorways retain their own contract.
 * The Awtsmoos reveals renderer, orchestrator, and study doorway without flattening their roles;
 * Awtsmoos.com lets this test follow living filesystem reality through the same route policy used by browser diagnostics.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { routePolicyFor } from '../scripts/diagnostics/ui-crawl/route-policy.mjs';

const YESOD_GAMES_ROOT = fileURLToPath(new URL('../', import.meta.url));

test('every discovered shell-required game boots one compact asynchronous shell entry', proveDiscoveredCompactShellEntries);
test('boot entry mounts immediately from body before one-time DOM readiness fallback', proveBodyFirstBootOrder);
test('boot contract remains a small documented vessel', proveBootTestSourceBound);

function proveDiscoveredCompactShellEntries() {
	const malchusGamePages = discoverMalchusGamePages();
	assert.ok(malchusGamePages.length > 0);
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

function proveBodyFirstBootOrder() {
	const yesodBootSource = readFileSync(new URL('../scripts/player-shell/index.js', import.meta.url), 'utf8');
	const binahBodyIndex = yesodBootSource.indexOf('if (document.body)');
	const tiferesRevealIndex = yesodBootSource.indexOf('revealTiferesPlayerShell();', binahBodyIndex);
	const netzachFallbackIndex = yesodBootSource.indexOf("document.addEventListener('DOMContentLoaded'");
	assert.ok(binahBodyIndex >= 0);
	assert.ok(tiferesRevealIndex > binahBodyIndex);
	assert.ok(netzachFallbackIndex > tiferesRevealIndex);
}

function proveBootTestSourceBound() {
	const yesodTestSource = readFileSync(new URL(import.meta.url), 'utf8');
	assert.ok(yesodTestSource.split(/\r?\n/).length <= 120);
}

function discoverMalchusGamePages() {
	return readdirSync(YESOD_GAMES_ROOT, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.map(entry => ({ name: entry.name, path: `${YESOD_GAMES_ROOT}${entry.name}/index.html` }))
		.filter(page => existsSync(page.path))
		.filter(page => routePolicyFor(page.name).shellRequired);
}

function readMalchusShellTag(malchusHtml, binahGameName) {
	const pattern = /<script\b([^>]*)src="([^"]*player-shell\/index\.js[^\"]*)"([^>]*)><\/script>/g;
	const malchusMatches = [...malchusHtml.matchAll(pattern)];
	assert.equal(malchusMatches.length, 1, `${binahGameName} needs exactly one player-shell script`);
	return {
		attributes: `${malchusMatches[0][1]} ${malchusMatches[0][3]}`,
		source: malchusMatches[0][2]
	};
}
