// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCompactBootstrap.test.js
 * @description Proves the compact entry settles its own module evaluation before the boot promise settles.
 * The Awtsmoos opens the doorway without waiting on the road; Awtsmoos.com refuses a top-level await
 * so the entry fact is witnessed even when deeper boot is still traveling.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('compact entry initializes and completes the entry milestone without awaiting boot', () => {
	const source = readEntrySource();
	assert.ok(source.includes('initializeMitzvahWorldEssentialBoot'));
	assert.ok(source.includes('ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED'));
	assert.deepEqual(topLevelAwaitLines(source), []);
});

test('topLevelAwaitLines flags only module-level awaits', () => {
	assert.deepEqual(topLevelAwaitLines('await boot();\n'), [1]);
	assert.deepEqual(topLevelAwaitLines('const promise = boot();\nawait promise;\n'), [2]);
	assert.deepEqual(topLevelAwaitLines('const f = async () => {\n  await boot();\n};\n'), []);
	assert.deepEqual(topLevelAwaitLines('async function f() {\n  await boot();\n}\n'), []);
	assert.deepEqual(topLevelAwaitLines('for (const x of y) {\n  await x;\n}\n'), [2]);
	assert.deepEqual(topLevelAwaitLines('// await boot();\nconst x = 1;\n'), []);
	assert.deepEqual(topLevelAwaitLines('const label = "await boot";\n'), []);
});

function readEntrySource() {
	return readFileSync(new URL('./MinimalMeadowCompactBootstrap.js', import.meta.url), 'utf8');
}

/** Returns 1-based lines whose await blocks module evaluation instead of an async function. */
function topLevelAwaitLines(source) {
	const code = stripNoise(source);
	const hits = [];
	const stack = [];
	let index = 0;
	let line = 1;
	while (index < code.length) {
		const character = code[index];
		if (character === '\n') {
			line += 1;
			index += 1;
			continue;
		}
		if (character === '{') {
			stack.push(braceKind(code, index));
			index += 1;
			continue;
		}
		if (character === '}') {
			stack.pop();
			index += 1;
			continue;
		}
		if (code.startsWith('await', index) && !isWordCharacter(code[index - 1] || ' ') && !isWordCharacter(code[index + 5] || ' ')) {
			if (!stack.includes('function')) {
				hits.push(line);
			}
			index += 5;
			continue;
		}
		index += 1;
	}
	return hits;
}

/** Classifies one brace as a function body or an ordinary block by looking backwards. */
function braceKind(code, braceIndex) {
	let cursor = braceIndex - 1;
	while (cursor >= 0 && /\s/.test(code[cursor])) {
		cursor -= 1;
	}
	if (cursor >= 1 && code[cursor] === '>' && code[cursor - 1] === '=') {
		return 'function';
	}
	if (code[cursor] === ')') {
		let depth = 1;
		cursor -= 1;
		while (cursor >= 0 && depth > 0) {
			if (code[cursor] === ')') {
				depth += 1;
			} else if (code[cursor] === '(') {
				depth -= 1;
			}
			cursor -= 1;
		}
		while (cursor >= 0 && /\s/.test(code[cursor])) {
			cursor -= 1;
		}
		const wordEnd = cursor;
		while (cursor >= 0 && isWordCharacter(code[cursor])) {
			cursor -= 1;
		}
		const word = code.slice(cursor + 1, wordEnd + 1);
		if (['if', 'for', 'while', 'switch', 'catch', 'with'].includes(word)) {
			return 'block';
		}
		return 'function';
	}
	return 'block';
}

/** Blanks comments and string text while keeping newlines and template code so lines stay true. */
function stripNoise(source) {
	let out = '';
	let index = 0;
	while (index < source.length) {
		const character = source[index];
		const next = source[index + 1];
		if (character === '/' && next === '/') {
			out += '  ';
			index += 2;
			while (index < source.length && source[index] !== '\n') {
				out += ' ';
				index += 1;
			}
			continue;
		}
		if (character === '/' && next === '*') {
			out += '  ';
			index += 2;
			while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
				out += source[index] === '\n' ? '\n' : ' ';
				index += 1;
			}
			out += '  ';
			index += 2;
			continue;
		}
		if (character === '\'' || character === '"') {
			out += '  ';
			index += 1;
			while (index < source.length && source[index] !== character) {
				if (source[index] === '\\') {
					out += '  ';
					index += 2;
					continue;
				}
				out += source[index] === '\n' ? '\n' : ' ';
				index += 1;
			}
			out += '  ';
			index += 1;
			continue;
		}
		if (character === '`') {
			out += ' ';
			index += 1;
			let expressionDepth = 0;
			while (index < source.length) {
				const inner = source[index];
				if (inner === '\\') {
					out += '  ';
					index += 2;
					continue;
				}
				if (expressionDepth === 0 && inner === '`') {
					out += ' ';
					index += 1;
					break;
				}
				if (inner === '$' && source[index + 1] === '{') {
					out += '${';
					index += 2;
					expressionDepth += 1;
					continue;
				}
				if (expressionDepth > 0 && inner === '{') {
					out += '{';
					index += 1;
					expressionDepth += 1;
					continue;
				}
				if (expressionDepth > 0 && inner === '}') {
					out += '}';
					index += 1;
					expressionDepth -= 1;
					continue;
				}
				if (expressionDepth > 0) {
					out += inner;
					index += 1;
					continue;
				}
				out += inner === '\n' ? '\n' : ' ';
				index += 1;
			}
			continue;
		}
		out += character;
		index += 1;
	}
	return out;
}

function isWordCharacter(character) {
	return /[A-Za-z0-9_$]/.test(character);
}
