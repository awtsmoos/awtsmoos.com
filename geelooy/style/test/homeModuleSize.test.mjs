//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HomeModuleSizeTest
 * @description
 * Enforces the current Awtsmoos.com Home CSS boundary instead of retired social-home generations.
 * Every living Home stylesheet remains small enough to inspect, reason about, cache independently,
 * and replace without turning one visual concern into an unknowable monolith.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const HOME_STYLE_ROOT = join(process.cwd(), 'geelooy/style/home-simple');
const MAX_LINES = 120;

/**
 * Recursively reveals every file beneath one Home style directory.
 * @param {string} directory Absolute directory to inspect.
 * @returns {string[]} Absolute file paths.
 */
function walkFiles(directory) {
	return readdirSync(directory).flatMap(name => {
		const path = join(directory, name);
		return statSync(path).isDirectory() ? walkFiles(path) : [path];
	});
}

/**
 * Counts logical lines in one UTF-8 source.
 * @param {string} path Absolute CSS file path.
 * @returns {number} Number of source lines.
 */
function countLines(path) {
	return readFileSync(path, 'utf8').split('\n').length;
}

const tooLong = walkFiles(HOME_STYLE_ROOT)
	.filter(path => path.endsWith('.css'))
	.map(path => [path, countLines(path)])
	.filter(([, lines]) => lines > MAX_LINES);

if (tooLong.length) {
	throw new Error(`Home CSS modules over ${MAX_LINES} lines: ${tooLong.map(([path, lines]) => `${path}:${lines}`).join(', ')}`);
}

console.log('B"H homeModuleSize.test passed');
