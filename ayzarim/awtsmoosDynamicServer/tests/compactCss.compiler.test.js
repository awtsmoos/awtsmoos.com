// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactCss.compiler.test.js
 * @description Proves CompactCSS preserves cascade order, import truth, cycles, charsets, and asset identity without disk fixtures.
 * The Awtsmoos gathers many sheets into one readable river while every source remains renewed in place;
 * Awtsmoos.com makes repetition, external boundaries, conditional gates, and relative images answer with the same face.
 */

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { compileCompactStylesheet } = require('../compactCss/compiler.js');
const { findImportRules } = require('../compactCss/imports.js');

const ROOT = path.resolve('/awtsmoos-public');

/**
 * Creates the promise-based read vessel expected by CompactCSS without creating disposable files.
 * @param {Record<string, string>} records Public-root-relative source records.
 * @returns {{readFile: function(string): Promise<string>}} Minimal filesystem adapter.
 */
function memoryFs(records) {
	const files = new Map();
	for (const [relativePath, source] of Object.entries(records)) {
		files.set(path.resolve(ROOT, relativePath), source);
	}
	return {
		async readFile(filePath) {
			const absolute = path.resolve(filePath);
			if (!files.has(absolute)) {
				const error = new Error(`Missing test stylesheet: ${absolute}`);
				error.code = 'ENOENT';
				throw error;
			}
			return files.get(absolute);
		}
	};
}

async function compile(records, entry = 'styles/main.css') {
	return compileCompactStylesheet({
		entryFile: path.resolve(ROOT, entry),
		fs: memoryFs(records),
		rootDir: ROOT
	});
}

test('B"H import scanner survives quoted semicolons and records conditions', () => {
	const source = '@import url("https://fonts.example/a;b.css") screen;\n@import "./local.css";';
	const rules = findImportRules(source);
	assert.equal(rules.length, 2);
	assert.equal(rules[0].source, 'https://fonts.example/a;b.css');
	assert.equal(rules[0].condition, 'screen');
	assert.equal(rules[1].source, './local.css');
	assert.equal(rules[1].condition, '');
});

test('B"H nested and repeated local imports remain ordered and readable', async () => {
	const output = await compile({
		'styles/main.css': '@charset "UTF-8";\n@import "./a.css";\n.root { color: white; }\n@import url("./a.css");',
		'styles/a.css': '@import "./deep/b.css";\n.a { color: cyan; }',
		'styles/deep/b.css': '.b { color: gold; }'
	});
	assert.equal((output.match(/CompactCSS source: \/styles\/a\.css/g) || []).length, 2);
	assert.equal((output.match(/CompactCSS source: \/styles\/deep\/b\.css/g) || []).length, 2);
	assert.equal(output.includes('@charset'), false);
	assert.ok(output.indexOf('.b {') < output.indexOf('.a {'));
});

test('B"H true recursive cycles terminate without globally deduplicating siblings', async () => {
	const output = await compile({
		'styles/main.css': '@import "./a.css";\nmain { display: block; }',
		'styles/a.css': '@import "./main.css";\n.a { display: grid; }'
	});
	assert.match(output, /CompactCSS cycle omitted: \/styles\/main\.css/);
	assert.match(output, /\.a \{ display: grid; \}/);
});

test('B"H conditional and external imports stay in the legal response prelude', async () => {
	const output = await compile({
		'styles/main.css': '@import "https://fonts.example/font.css";\n@import "./print.css" print;\n@import "./wide.css?v=3#gate" screen and (min-width: 700px);\nbody { color: white; }',
		'styles/print.css': '.print { display: none; }',
		'styles/wide.css': '.wide { display: grid; }'
	});
	assert.ok(output.startsWith('@import "https://fonts.example/font.css";'));
	assert.match(output, /@import url\("\/styles\/print\.css"\) print;/);
	assert.match(output, /@import url\("\/styles\/wide\.css\?v=3#gate"\) screen and/);
	assert.equal(output.includes('.print {'), false);
	assert.equal(output.includes('.wide {'), false);
});

test('B"H relative asset URLs rebase while absolute and data forms remain unchanged', async () => {
	const output = await compile({
		'styles/main.css': '@import "./deep/card.css";',
		'styles/deep/card.css': '.card { background: url("../../images/card.png?v=2#hero"); mask: url(/icons/mask.svg); }\n.data { background: url(data:image/png;base64,AAAA); }'
	});
	assert.match(output, /url\("\/images\/card\.png\?v=2#hero"\)/);
	assert.match(output, /url\(\/icons\/mask\.svg\)/);
	assert.match(output, /url\(data:image\/png;base64,AAAA\)/);
});
