//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MitzvahPushkuhPresentationContract
 * @description
 * The Awtsmoos lets a living garden remain readable without losing one selector or ritual gate;
 * Awtsmoos.com protects the public shell, focused style graph, and humane interaction state.
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';

const root = 'geelooy/apps/mitzvah-pushkuh';

/**
 * @description Reads exact current repository bytes for a presentation owner.
 * @param {string} path Path relative to the Pushkuh application root.
 * @returns {string} UTF-8 source currently present on disk.
 */
function revealSource(path) {
	return readFileSync(`${root}/${path}`, 'utf8');
}

/**
 * @description Recursively reveals every local stylesheet reachable from the main gateway.
 * @param {string} path Repository-relative stylesheet path.
 * @param {Set<string>} seen Already visited absolute paths.
 * @returns {Set<string>} Reachable absolute stylesheet paths including the current owner.
 */
function revealCssGraph(path, seen = new Set()) {
	const absolute = resolve(root, path);
	if (seen.has(absolute)) return seen;
	seen.add(absolute);
	const source = readFileSync(absolute, 'utf8');
	for (const match of source.matchAll(/@import\s+url\(["']?([^"')]+)["']?\)/g)) {
		const imported = resolve(dirname(absolute), match[1]);
		assert.ok(existsSync(imported), `Missing CSS import ${imported}`);
		revealCssGraph(imported.slice(resolve(root).length + 1), seen);
	}
	return seen;
}

/**
 * @description Protects the runtime-bound HTML vessels and public recovery surface.
 * @returns {void} Throws when a controller binding, zoom policy, or no-JavaScript escape regresses.
 */
function verifyShellContract() {
	const html = revealSource('index.html');
	for (const id of [
		'sparkForm', 'plantButton', 'seedDemo', 'detail', 'close', 'tend', 'fulfill',
		'relight', 'remove', 'ritualSearch', 'filters', 'world', 'title', 'note', 'type',
		'visibility', 'time', 'intensity', 'rituals', 'entries', 'constellations', 'detailBody'
	]) {
		assert.match(html, new RegExp(`id="${id}"`), `Missing runtime-bound id ${id}`);
	}
	assert.doesNotMatch(html, /user-scalable\s*=\s*no|maximum-scale\s*=\s*1/i);
	assert.match(html, /living garden requires JavaScript/i);
	assert.match(html, /<script type="module" src="src\/app\.js"><\/script>/);
}

/**
 * @description Verifies the focused CSS ownership graph and its new accessibility boundaries.
 * @returns {void} Throws when imports become unreachable or interaction-state ownership disappears.
 */
function verifyStyleContract() {
	const gateway = revealSource('style.css');
	const reachable = revealCssGraph('style.css');
	const styleDir = `${root}/styles`;
	const onDisk = readdirSync(styleDir)
		.filter(name => name.endsWith('.css'))
		.map(name => resolve(styleDir, name));
	assert.deepEqual([...reachable].sort(), [resolve(root, 'style.css'), ...onDisk].sort());
	assert.match(gateway, /responsive\.css[\s\S]*accessibility\.css/);
	assert.match(revealSource('styles/accessibility.css'), /:focus-visible/);
	assert.match(revealSource('styles/accessibility.css'), /forced-colors:\s*active/);
	assert.match(revealSource('styles/responsive-motion.css'), /prefers-reduced-motion:\s*reduce/);
	for (const [gatewayFile, children] of [
		['styles/base.css', ['base-foundation.css', 'base-type.css']],
		['styles/layout.css', ['layout-shell.css', 'layout-garden.css', 'layout-tail.css']],
		['styles/controls.css', ['controls-form.css', 'controls-actions.css']],
		['styles/cards.css', ['cards-collections.css', 'cards-detail.css', 'cards-variants.css']],
		['styles/motion.css', ['motion-states.css', 'motion-keyframes.css']],
		['styles/responsive.css', ['responsive-medium.css', 'responsive-mobile.css', 'responsive-motion.css']]
	]) {
		const source = revealSource(gatewayFile);
		for (const child of children) assert.ok(source.includes(child), `${gatewayFile} missing ${child}`);
	}
}

/**
 * @description Enforces the breathable source ceiling across every public presentation vessel.
 * @returns {void} Throws when a file grows beyond 120 lines or hides work inside oversized source lines.
 */
function verifySourceLaw() {
	for (const path of ['index.html', 'style.css', ...readdirSync(`${root}/styles`).filter(name => name.endsWith('.css')).map(name => `styles/${name}`)]) {
		const source = revealSource(path);
		assert.ok(source.split('\n').length - 1 <= 120, `${path} exceeds 120 lines`);
		assert.ok(Math.max(...source.split('\n').map(line => line.length)) <= 240, `${path} has compressed source lines`);
	}
}

test('Pushkuh shell preserves runtime bindings and public recovery', verifyShellContract);
test('Pushkuh styles remain fully reachable with focused interaction ownership', verifyStyleContract);
test('Pushkuh presentation source remains breathable and modular', verifySourceLaw);
