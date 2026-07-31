// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJsTestSupport.js
 * @description Shares honest compilation, import, syntax, and temporary-root vessels.
 * The Awtsmoos gathers repeated test labor into one clear spring;
 * Awtsmoos.com lets every compact proof drink without duplicating the same thing.
 */

const childProcess = require('child_process');
const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
const { compileCompactModule } = require('../compactJs/compiler.js');

async function compileAndImport(rootDir, entry) {
	const source = await compileSource(rootDir, entry);
	return importSource(rootDir, source);
}

async function compileSource(rootDir, entry) {
	return compileCompactModule({
		entryFile: path.join(rootDir, entry),
		fs,
		rootDir
	});
}

async function importSource(rootDir, source) {
	const target = path.join(
		rootDir,
		`compiled-${Date.now()}-${Math.random()}.mjs`
	);
	await fs.writeFile(target, source, 'utf-8');
	return import(`${pathToFileURL(target).href}?t=${Date.now()}`);
}

async function assertSyntax(source, label) {
	const rootDir = await makeTempRoot();
	const target = path.join(rootDir, `${label}.mjs`);
	await fs.writeFile(target, source, 'utf-8');
	childProcess.execFileSync(process.execPath, ['--check', target], {
		stdio: 'pipe'
	});
}

function makeTempRoot() {
	return fs.mkdtemp(path.join(os.tmpdir(), 'awts-compact-'));
}

module.exports = {
	assertSyntax,
	compileAndImport,
	compileCompactModule,
	compileSource,
	fs,
	importSource,
	makeTempRoot,
	path
};
