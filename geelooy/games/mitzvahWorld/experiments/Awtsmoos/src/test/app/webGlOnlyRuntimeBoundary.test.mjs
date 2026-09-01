// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file webGlOnlyRuntimeBoundary.test.mjs
 * @description Guards the runtime tree against reintroducing the removed Canvas gameplay architecture or its old renderer evidence module.
 * The Awtsmoos keeps one true WebGL path from source tree to living frame;
 * Awtsmoos.com turns forbidden substitute names into a failing test before production can inherit their claim.
 */

import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const SOURCE_ROOT = new URL('../../', import.meta.url);
const RUNTIME_DIRS = ['app', 'launcher', 'world'];
const FORBIDDEN = [
	'CanvasMeadowRenderer',
	'canvas-2d-fallback',
	'fallback-2d',
	'MinimalCanvasMeadow'
];
const REMOVED_FILES = [
	'app/RendererFallbackEvidence.js',
	'app/MinimalCanvasMeadowActor.js',
	'app/MinimalCanvasMeadowBackdrop.js'
];

test('B"H runtime source contains no Canvas gameplay fallback tokens', async () => {
	const violations = [];
	for (const directory of RUNTIME_DIRS) {
		for (const file of await sourceFiles(new URL(`${directory}/`, SOURCE_ROOT))) {
			const source = await readFile(file, 'utf8');
			for (const token of FORBIDDEN) {
				if (source.includes(token)) violations.push(`${file.pathname}:${token}`);
			}
		}
	}
	assert.deepEqual(violations, []);
});

test('B"H deleted fallback renderer modules cannot be imported from runtime source', async () => {
	for (const relativePath of REMOVED_FILES) {
		await assert.rejects(access(new URL(relativePath, SOURCE_ROOT)));
	}
});

async function sourceFiles(directoryUrl) {
	const entries = await readdir(directoryUrl, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const child = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directoryUrl);
		if (entry.isDirectory()) {
			files.push(...await sourceFiles(child));
		} else if (/\.(?:js|mjs)$/.test(entry.name)) {
			files.push(child);
		}
	}
	return files;
}
