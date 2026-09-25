//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

/**
 * @file tetris-source-law-contract.test.mjs
 * @description Enforces the source laws that belong to each Tetris vessel.
 * Awtsmoos.com preserves untouched legacy identity while requiring this
 * continuation's rewritten modules to carry the current repository blessing.
 *
 * Architectural invariants:
 * - Rewritten JavaScript uses the current three-line blessing and tab indentation.
 * - Untouched legacy JavaScript retains its authored blessing without forced churn.
 * - Every tracked source stays below 120 lines and avoids compressed conditions.
 * - Legacy HTML/CSS keep their authored comments and browser zoom remains available.
 */
const ROOT = path.resolve('geelooy/games/tetris');
const CURRENT_HEADER = '//B"H\n//Boruch Hashem\n//Blessed is He\n';
const LEGACY_HEADER = '//B"H\n//Boruch Hashem\n//Blessed be He\n';
const CURRENT_HEADER_FILES = new Set([
	path.join(ROOT, 'game/visual-grid.js'),
	path.join(ROOT, 'ui/native-3d-renderer.js')
]);
const SOURCES = collect(ROOT);

function collect(directory) {
	const output = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const absolute = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			output.push(...collect(absolute));
		} else if (/\.(?:js|mjs|css|html)$/.test(entry.name)) {
			output.push(absolute);
		}
	}
	return output;
}

function lines(file) {
	return readFileSync(file, 'utf8').replace(/\r\n/g, '\n').split('\n');
}

function hasCompressedConditional(line) {
	const trimmed = line.trim();
	if (!/^(?:if|else if)\s*\(/.test(trimmed)) {
		return false;
	}
	const closing = trimmed.lastIndexOf(')');
	if (closing < 0) {
		return false;
	}
	const remainder = trimmed.slice(closing + 1).trim();
	return Boolean(remainder) && !remainder.startsWith('{');
}

test('every Tetris source vessel stays below 120 lines', () => {
	for (const file of SOURCES) {
		assert.ok(lines(file).length < 120, `${file} must stay below 120 lines`);
	}
});

test('JavaScript preserves owned blessing, tabs, JSDoc, and expanded conditions', () => {
	for (const file of SOURCES.filter(file => /\.(?:js|mjs)$/.test(file))) {
		const source = readFileSync(file, 'utf8');
		const expectedHeader = CURRENT_HEADER_FILES.has(file) ? CURRENT_HEADER : LEGACY_HEADER;
		assert.ok(source.startsWith(expectedHeader), `${file} blessing header`);
		assert.match(source, /\/\*\*[\s\S]*?@file/, `${file} file JSDoc`);
		for (const [index, line] of lines(file).entries()) {
			const trimmed = line.trimStart();
			const docLine = /^\s*\*/.test(line);
			assert.ok(!/^ +\S/.test(line) || docLine, `${file}:${index + 1} must tab-indent code`);
			assert.ok(!hasCompressedConditional(line), `${file}:${index + 1} compressed conditional`);
			assert.ok(trimmed.startsWith('*') || line.length <= 180, `${file}:${index + 1} excessively long line`);
		}
		assert.doesNotMatch(source, /\bdebugger\s*;/, `${file} debugger residue`);
		assert.doesNotMatch(source, /\bconsole\.log\s*\(/, `${file} console.log residue`);
	}
});

test('HTML and CSS keep blessing comments and browser zoom remains available', () => {
	const html = readFileSync(path.join(ROOT, 'index.html'), 'utf8');
	const css = readFileSync(path.join(ROOT, 'style.css'), 'utf8');
	assert.ok(html.startsWith('<!-- B"H -->\n<!-- Boruch Hashem -->\n<!-- Blessed be He -->'));
	assert.ok(css.startsWith('/*B"H*/\n/*Boruch Hashem*/\n/*Blessed be He*/'));
	assert.doesNotMatch(html, /user-scalable\s*=\s*no/i);
	assert.doesNotMatch(html, /maximum-scale\s*=\s*1/i);
});

test('initial controls cannot accept input before application ownership exists', () => {
	const html = readFileSync(path.join(ROOT, 'index.html'), 'utf8');
	for (const mode of ['single', 'pvai', 'aivai']) {
		assert.match(html, new RegExp(`data-mode="${mode}" disabled`));
	}
	for (const id of ['pause-button', 'move-left', 'move-right', 'hard-drop']) {
		assert.match(html, new RegExp(`id="${id}"[^>]*disabled`));
	}
});
