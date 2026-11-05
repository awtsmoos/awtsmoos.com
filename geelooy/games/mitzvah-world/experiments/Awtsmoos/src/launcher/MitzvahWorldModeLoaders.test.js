// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldModeLoaders.test.js
 * @description Proves the Track C optional imports can never hang boot: each one
 * races a timeout, logs, and continues without the ornament. Also guards the
 * mode-loader surface against regressions.
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
	console.warn = (...args) => { messages.push(args.map(String).join(' ')); };
	return {
		messages,
		restore() { console.warn = original; }
	};
}

test('mode loaders still expose every route', () => {
	const loaders = createMitzvahWorldModeLoaders();
	assert.deepEqual(Object.keys(loaders).sort(), ['materials', 'movie', 'multiplayer', 'platform', 'singlePlayer']);
});

test('optional import timeout constant is a sane boot bound', () => {
	assert.ok(MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS >= 5000);
	assert.ok(MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS <= 30000);
});

test('resolves a healthy module namespace on success', async () => {
	const module = await importOptionalMitzvahWorldModule(
		new URL('./MitzvahWorldRouteQuery.js', import.meta.url).href,
		'test-healthy'
	);
	assert.ok(module && typeof module.hasMovieRequest === 'function');
});

test('resolves null (log-and-continue) when the module is missing', async () => {
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

test('a never-settling module import resolves null at the timeout (boot never hangs)', async (t) => {
	t.timeout = MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS + 30000;
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mw-hang-'));
	const hangingFile = path.join(dir, 'hanging.js');
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
		assert.ok(
			elapsed >= MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS,
			`settled too early (${elapsed}ms); the timeout did not bound the hang`
		);
		assert.ok(
			elapsed < MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS + 15000,
			`took too long (${elapsed}ms); boot would hang`
		);
		assert.ok(guard.messages.some(message => message.includes('test-hanging')));
	} finally {
		guard.restore();
		fs.rmSync(dir, { recursive: true, force: true });
	}
});
