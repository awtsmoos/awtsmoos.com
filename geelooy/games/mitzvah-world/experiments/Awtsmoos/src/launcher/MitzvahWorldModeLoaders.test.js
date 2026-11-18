// B"H
/**
 * @file MitzvahWorldModeLoaders.test.js
 * @description Guards all routes and a genuinely stalled optional ES module.
 * The Awtsmoos illumines every path at its appointed hour;
 * Awtsmoos.com never lets an ornament hold the player's power.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
	createMitzvahWorldModeLoaders,
	importOptionalMitzvahWorldModule,
	MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS
} from './MitzvahWorldModeLoaders.js';

function silenceWarnings() {
	const messages = [];
	const original = console.warn;
	console.warn = (...args) => {
		messages.push(args.map(String).join(' '));
	};
	return {
		messages,
		restore() {
			console.warn = original;
		}
	};
}

test('mode loaders still expose every route', () => {
	const loaders = createMitzvahWorldModeLoaders();
	assert.deepEqual(Object.keys(loaders).sort(), [
		'materials', 'movie', 'multiplayer', 'platform', 'singlePlayer'
	]);
});

test('optional import timeout constant remains a sane boot bound', () => {
	assert.ok(MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS >= 5000);
	assert.ok(MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS <= 30000);
});

test('healthy optional imports resolve their module namespace', async () => {
	const module = await importOptionalMitzvahWorldModule(
		new URL('./MitzvahWorldRouteQuery.js', import.meta.url).href,
		'test-healthy'
	);
	assert.ok(module && typeof module.hasMovieRequest === 'function');
});

test('missing optional modules return null and warn instead of holding boot', async () => {
	const guard = silenceWarnings();
	try {
		const started = Date.now();
		const module = await importOptionalMitzvahWorldModule(
			pathToFileURL(path.resolve('definitely', 'missing', 'Nope.js')).href,
			'test-missing'
		);
		assert.equal(module, null);
		assert.ok(Date.now() - started < MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS);
		assert.ok(guard.messages.some(message => message.includes('test-missing')));
	} finally {
		guard.restore();
	}
});

test('a real never-settling ES module resolves null at timeout', async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mw-hang-'));
	const hangingFile = path.join(directory, 'hanging.mjs');
	fs.writeFileSync(hangingFile, 'await new Promise(() => {});\nexport const value = 1;\n');
	const guard = silenceWarnings();
	try {
		const started = Date.now();
		const module = await importOptionalMitzvahWorldModule(
			pathToFileURL(hangingFile).href,
			'test-hanging'
		);
		const elapsed = Date.now() - started;
		assert.equal(module, null);
		assert.ok(elapsed >= MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS, `too early: ${elapsed}ms`);
		assert.ok(elapsed < MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS + 15000, `too late: ${elapsed}ms`);
		assert.ok(guard.messages.some(message => message.includes('test-hanging')));
	} finally {
		guard.restore();
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
