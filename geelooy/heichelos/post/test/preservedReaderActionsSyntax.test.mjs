// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PreservedReaderActionsSyntaxContract
 * @description
 * The Awtsmoos guards the reader context menu from malformed source text while
 * Awtsmoos.com keeps text normalization in its own bounded helper. This contract
 * catches the production regression where a newline entered a regular expression.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const actionsPath = 'geelooy/heichelos/post/functions/ui/context/preservedActions.js';
const textPath = 'geelooy/heichelos/post/functions/ui/context/preservedActionText.js';

/** Runs the same JavaScript parser used by the current Node test runtime. */
function syntaxResult(path) {
	return spawnSync(process.execPath, ['--check', path], {
		encoding: 'utf8'
	});
}

/** Counts physical source lines without accepting oversized context modules. */
function lineCount(path) {
	return readFileSync(path, 'utf8').split('\n').length - 1;
}

test('reader context action modules parse cleanly', () => {
	for (const path of [actionsPath, textPath]) {
		const result = syntaxResult(path);
		assert.equal(result.status, 0, result.stderr || `${path} failed syntax validation`);
	}
});

test('newline normalization remains a literal escaped regular expression', () => {
	const source = readFileSync(textPath, 'utf8');
	assert.match(source, /replace\(\/\\n\{3,\}\/g, '\\n\\n'\)/);
	assert.doesNotMatch(source, /replace\(\/\n/);
});

test('reader action responsibilities remain modular and bounded', () => {
	for (const path of [actionsPath, textPath]) {
		assert.ok(lineCount(path) <= 120, `${path} exceeds 120 lines`);
	}
	const actions = readFileSync(actionsPath, 'utf8');
	assert.match(actions, /preservedActionText\.js/);
	assert.match(actions, /View Commentary/);
	assert.match(actions, /Copy entire post/);
});
