// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelCssSplitTest
 * @description
 * The Awtsmoos verifies the active Heichel CSS graph rather than mistaking
 * dormant compatibility files for production imports inside Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import {
	existsSync,
	readFileSync
} from 'node:fs';
import path from 'node:path';

const DIRECTORY = 'geelooy/style/heichelos/heichel';
const ENTRY = `${DIRECTORY}/index.css`;
const REQUIRED_ROOT_IMPORTS = Object.freeze([
	'tokens.css',
	'shell.css',
	'hero.css',
	tabsFile(),
	'series-list.css',
	'search.css',
	'bottom-nav.css',
	'mobile.css',
	'sovereign.css',
	'controls.css'
]);

function tabsFile() {
	return 'tabs.css';
}

function cleanTarget(target) {
	return target.split(/[?#]/, 1)[0];
}

function localImports(source) {
	return [...source.matchAll(/@import\s+(?:url\()?['"]([^'")]+)['"]/g)]
		.map(match => cleanTarget(match[1]))
		.filter(target => target.startsWith('.'));
}

const entrySource = readFileSync(ENTRY, 'utf8');
const directImports = localImports(entrySource);

for (const required of REQUIRED_ROOT_IMPORTS) {
	assert.ok(
		directImports.includes(`./${required}`),
		`index.css must import ${required}`
	);
}

for (const target of directImports) {
	const absolute = path.normalize(path.join(DIRECTORY, target));
	assert.ok(existsSync(absolute), `missing imported stylesheet ${absolute}`);
	const source = readFileSync(absolute, 'utf8');
	assert.ok(
		source.split('\n').length <= 150,
		`${absolute} must stay under 150 lines`
	);
}

assert.equal(
	existsSync('geelooy/style/heichelos/heichel.css'),
	false,
	'old heichel.css monolith must be gone'
);
console.log('B"H heichelCssSplit.test passed');
