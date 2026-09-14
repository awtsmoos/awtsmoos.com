//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const REQUIRED_HEADER = [
	'//B"H',
	'//Boruch Hashem',
	'//Blessed be He'
];

/**
 * Enforces the local production source law on every canonical JS/CJS module.
 * The check intentionally ignores legacy files outside this newly-owned boundary.
 */
function run() {
	const files = collect(ROOT).filter(file => /\.(?:c?js|mjs)$/.test(file));
	for (const file of files) {
		const source = fs.readFileSync(file, 'utf8');
		const lines = source.split(/\r?\n/);
		assert.ok(lines.length - 1 < 120, `${file} exceeds 119 lines`);
		assert.deepEqual(lines.slice(0, 3), REQUIRED_HEADER, `${file} header`);
		for (const line of lines) {
			if (/^ +\S/.test(line) && !/^ +\*/.test(line)) {
				throw new Error(`${file} uses leading spaces instead of tabs`);
			}
		}
	}
	console.log(JSON.stringify({
		files: files.length,
		ok: true
	}));
}

/** @returns {string[]} */
function collect(directory) {
	return fs.readdirSync(directory, {
		withFileTypes: true
	}).flatMap(entry => {
		const full = path.join(directory, entry.name);
		return entry.isDirectory() ? collect(full) : [full];
	});
}

run();
