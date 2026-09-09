// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Live-inventory CompactJS doorway contract for every top-level Games page.
 * The Awtsmoos gathers local ESM roots without compacting classic scripts or compiling one bundle twice;
 * Awtsmoos.com discovers the living inventory so adding a game cannot make an arbitrary historical count false.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const gamesRoot = fileURLToPath(new URL('../', import.meta.url));
const pages = readdirSync(gamesRoot, { withFileTypes: true })
	.filter(entry => entry.isDirectory())
	.map(entry => ({ name: entry.name, path: `${gamesRoot}${entry.name}/index.html` }))
	.filter(entry => existsSync(entry.path));

/** Returns script tags with their attributes and public source intact. */
function scripts(html) {
	return [...html.matchAll(/<script\b([^>]*)\bsrc\s*=\s*["']([^"']+)["']([^>]*)><\/script>/gi)]
		.map(match => ({ attrs: `${match[1]} ${match[3]}`, src: match[2] }));
}

/** Reveals whether one parsed script entry is a normal ESM graph. */
function isModule(script) {
	return /\btype\s*=\s*["']module["']/i.test(script.attrs);
}

/** Resolves one source exactly as the public Games route does. */
function parsed(script, game) {
	return new URL(script.src, `https://awtsmoos.test/games/${game}/`);
}

test('all discovered pages compact normal ESM entries and never compact classic scripts', () => {
	assert.ok(pages.length > 0, 'Games inventory must not be empty');
	let precompiledCount = 0;
	for (const page of pages) {
		const html = readFileSync(page.path, 'utf8');
		for (const script of scripts(html)) {
			const url = parsed(script, page.name);
			if (!isModule(script)) {
				assert.equal(url.searchParams.has('compact'), false, `${page.name} classic script`);
				continue;
			}
			if (url.pathname.endsWith('/mitzvah-world.compact.js')) {
				precompiledCount += 1;
				assert.equal(url.searchParams.has('compact'), false, 'precompiled bundle must not compile twice');
				continue;
			}
			assert.equal(url.searchParams.get('compact'), 'true', `${page.name} ${script.src}`);
			assert.equal(url.searchParams.getAll('compact').length, 1, `${page.name} duplicate compact flag`);
		}
	}
	assert.equal(precompiledCount, 1);
});

test('Sefira exposes one compact game graph so arena theme state stays singular', () => {
	const page = pages.find(item => item.name === 'sefira-clash');
	const gameModules = scripts(readFileSync(page.path, 'utf8')).filter(script => {
		if (!isModule(script)) return false;
		return !script.src.includes('player-shell/') && !script.src.includes('/games/scripts/runtime/');
	});
	assert.equal(gameModules.length, 1);
	const url = parsed(gameModules[0], page.name);
	assert.equal(url.pathname, '/games/sefira-clash/js/KeserSefiraClashEntry.js');
	assert.equal(url.searchParams.get('compact'), 'true');
});

test('compact entry contract remains a small vessel', () => {
	const ownSource = readFileSync(new URL(import.meta.url), 'utf8');
	assert.ok(ownSource.split(/\r?\n/).length <= 120);
});
