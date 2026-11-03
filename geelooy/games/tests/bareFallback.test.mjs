// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BareGamesFallbackTests
 * @description
 * The Awtsmoos provides real links even when an imported module fails;
 * Awtsmoos.com protects the reader from untrusted markup and waiting trails.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { renderBareGames, safeGamePath } from '../scripts/catalog/BareGamesFallback.js';

const base = 'https://awtsmoos.com/games/';

/** Creates lightweight DOM objects, without invoking a real browser or site. */
function makePage() {
	const section = {
		children: [],
		replaceChildren(...children) { this.children = children; }
	};
	const count = { textContent: '' };
	const status = { textContent: '' };
	const nodes = { gamesCatalog: section, gameCount: count, catalogStatus: status };
	const makeNode = type => ({
		type,
		children: [],
		textContent: '',
		href: '',
		append(child) { this.children.push(child); }
	});
	return {
		baseURI: base,
		nodes,
		createElement: makeNode,
		createDocumentFragment: () => makeNode('fragment'),
		getElementById: id => nodes[id] || null
	};
}

test('known local games preserve URL queries and fragments', () => {
	assert.equal(
		safeGamePath({ href: './merkava/?mode=solo#play' }, base),
		'/games/merkava/?mode=solo#play'
	);
});

test('foreign and executable URL schemes never become game destinations', () => {
	assert.equal(safeGamePath({ href: 'https://other.example/play' }, base), '');
	assert.equal(safeGamePath({ href: 'javascript:alert(1)' }, base), '');
	assert.equal(safeGamePath({ href: 'data:text/html,hi' }, base), '');
});

test('fallback text stays literal without HTML interpolation', () => {
	const page = makePage();
	const count = renderBareGames(page, [
		{ href: './merkava/', title: '<script>alert(1)</script>', description: '<img src=x>' }
	]);
	const anchor = page.nodes.gamesCatalog.children[0].children[0];
	assert.equal(count, 1);
	assert.equal(anchor.href, '/games/merkava/');
	assert.equal(anchor.children[0].textContent, '<script>alert(1)</script>');
	assert.equal(anchor.children[1].textContent, '<img src=x>');
	assert.equal(page.nodes.gameCount.textContent, '1 playable games');
});

test('fallback without catalog data still provides two playable routes', () => {
	const page = makePage();
	assert.equal(renderBareGames(page), 2);
	assert.equal(page.nodes.gamesCatalog.children[0].children.length, 2);
});

test('Games entry has a bounded emergency timer and native link fallback', () => {
	const source = readFileSync(new URL('../scripts/games-index.js', import.meta.url), 'utf8');
	assert.match(source, /GAMES_FALLBACK_DELAY_MS = 3500/);
	assert.match(source, /document\.createElement\('a'\)/);
	assert.match(source, /revealEmergencyLinks\(\)/);
	assert.doesNotMatch(source, /\.innerHTML\s*=/);
});

test('video curtain is disabled only for Games, without global hidden state', () => {
	const source = readFileSync(new URL('../../css/video-loader.css', import.meta.url), 'utf8');
	assert.match(source, /body\[data-geelooy-route="games"\] #awtsmoos-video-loader/);
	assert.match(source, /pointer-events:\s*none/);
	assert.match(source, /visibility:\s*hidden/);
	assert.match(source, /\.awtsmoos-video-loader\s*\{[\s\S]*?opacity:\s*1/);
});
