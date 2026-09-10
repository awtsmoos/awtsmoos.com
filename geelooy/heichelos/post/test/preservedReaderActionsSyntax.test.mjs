//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file PreservedReaderActionsSyntaxContract
 * @description Proves contextual actions, reader text, and global utilities remain separate, valid, and bounded.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const actionsPath = 'geelooy/heichelos/post/functions/ui/context/preservedActions.js';
const textPath = 'geelooy/heichelos/post/functions/ui/context/preservedActionText.js';
const utilityPath = 'geelooy/heichelos/post/functions/ui/context/preservedUtilityActions.js';
const modules = Object.freeze([actionsPath, textPath, utilityPath]);

/** Runs the JavaScript parser used by the active Node test runtime. */
function syntaxResult(path) {
	return spawnSync(process.execPath, ['--check', path], {
		encoding: 'utf8'
	});
}

/** Counts physical source lines without permitting oversized context modules. */
function lineCount(path) {
	return readFileSync(path, 'utf8').split('\n').length - 1;
}

test('reader context action modules parse cleanly', () => {
	for (const path of modules) {
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
	for (const path of modules) {
		assert.ok(lineCount(path) <= 120, `${path} exceeds 120 lines`);
	}
	const actions = readFileSync(actionsPath, 'utf8');
	const utilities = readFileSync(utilityPath, 'utf8');
	assert.match(actions, /preservedActionText\.js/);
	assert.match(actions, /preservedUtilityActions\.js/);
	assert.match(actions, /View Commentary/);
	assert.match(utilities, /Copy entire post/);
});
