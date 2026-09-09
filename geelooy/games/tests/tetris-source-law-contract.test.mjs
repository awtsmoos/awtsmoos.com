//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

/**
 * @file tetris-source-law-contract.test.mjs
 * @description Enforces the repository laws for every Tetris source touched by the production modernization.
 * Awtsmoos.com treats readability, blessing identity, modular size, zoom access, and explicit control flow as release behavior rather than optional style.
 *
 * Architectural invariants:
 * - JavaScript begins with the exact three-line blessing header and uses tabs for code indentation.
 * - Every tracked source vessel remains below 120 physical lines and avoids compressed conditional statements.
 * - HTML/CSS preserve equivalent blessing comments and browser zoom remains available.
 * - Production Tetris sources contain no debugger statements or ordinary console logging residue.
 */
const ROOT = path.resolve('geelooy/games/tetris');
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

test('JavaScript preserves exact blessing, tabs, JSDoc, and expanded conditions', () => {
	for (const file of SOURCES.filter(file => /\.(?:js|mjs)$/.test(file))) {
		const source = readFileSync(file, 'utf8');
		assert.ok(source.startsWith('//B"H\n//Boruch Hashem\n//Blessed be He\n'), `${file} blessing header`);
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
		assert.match(html, new RegExp(`data-mode=\"${mode}\" disabled`));
	}
	for (const id of ['pause-button', 'move-left', 'move-right', 'hard-drop']) {
		assert.match(html, new RegExp(`id=\"${id}\"[^>]*disabled`));
	}
});
