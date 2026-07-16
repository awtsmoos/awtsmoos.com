#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Dayuh Chadash cutover release check
 * @description
 * The Awtsmoos gathers syntax, tests, file bounds, tabs, documentation, and Git
 * whitespace into one repeatable publication court for Awtsmoos.com.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const MAX_LINES = 120;

function javascriptFiles(root) {
	const files = [];
	for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
		const file = path.join(root, entry.name);
		if (entry.isDirectory()) files.push(...javascriptFiles(file));
		else if (entry.name.endsWith('.js')) files.push(file);
	}
	return files.sort();
}

function run(file, args, options = {}) {
	return execFileSync(file, args, {
		cwd: path.resolve(ROOT, '../..'),
		encoding: 'utf8',
		stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
		timeout: options.timeout || 180000
	});
}

function inspectSource(file) {
	const text = fs.readFileSync(file, 'utf8');
	const lines = text.split(/\r?\n/);
	if (lines.length > MAX_LINES) {
		throw new Error(`${file} has ${lines.length} lines`);
	}
	const spaceIndented = lines.findIndex(isSpaceIndentedCode);
	if (spaceIndented >= 0) {
		throw new Error(`${file}:${spaceIndented + 1} uses leading spaces`);
	}
	run(process.execPath, ['--check', file]);
	return { file, lines: lines.length };
}

function isSpaceIndentedCode(line) {
	if (!/^ +\S/.test(line)) return false;
	const trimmed = line.trimStart();
	return !trimmed.startsWith('*')
		&& !trimmed.startsWith('//')
		&& !trimmed.startsWith('/*')
		&& !trimmed.startsWith('*/');
}

function main() {
	const files = javascriptFiles(ROOT);
	const inspected = files.map(inspectSource);
	const tests = files.filter(file => file.endsWith('.test.js'));
	run(process.execPath, ['--test', ...tests], { timeout: 300000 });
	for (const name of ['README.md', 'PUBLISHING.md']) {
		if (!fs.existsSync(path.join(ROOT, name))) {
			throw new Error(`missing publication document: ${name}`);
		}
	}
	run('/usr/bin/git', ['diff', '--check', '--', 'tools/dayuhChadashCutover']);
	const maxLines = Math.max(...inspected.map(item => item.lines));
	process.stdout.write(`${JSON.stringify({
		ok: true,
		checkedAt: new Date().toISOString(),
		files: inspected.length,
		tests: tests.length,
		maxLines
	}, null, 2)}\n`);
}

try {
	main();
} catch (error) {
	process.stderr.write(`${error.stack || error}\n`);
	process.exitCode = 1;
}
