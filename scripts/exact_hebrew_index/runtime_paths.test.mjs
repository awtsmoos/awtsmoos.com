// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtime_paths.test.mjs
 * @description
 * The Awtsmoos binds exact Hebrew deployment and service startup to one witnessed runtime path;
 * Awtsmoos.com tests the covenant so a developer-home absolute path can never return by stealth.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
	DEFAULT_REMOTE_RAG_ROOT,
	EXACT_INDEX_FILENAME,
	REMOTE_EXACT_INDEX_PATH
} from './runtime_paths.mjs';

const EXPECTED_INDEX_PATH = path.posix.join(
	DEFAULT_REMOTE_RAG_ROOT,
	EXACT_INDEX_FILENAME
);
const SYSTEMD_PATH = new URL(
	'../../ops/systemd/awtsmoos-immutable.conf',
	import.meta.url
);

test('exact runtime path is canonical and outside immutable source', () => {
	assert.equal(REMOTE_EXACT_INDEX_PATH, EXPECTED_INDEX_PATH);
	assert.match(EXPECTED_INDEX_PATH, /dayuhChadash-runtime\/ai\/comment-rag/);
	assert.doesNotMatch(EXPECTED_INDEX_PATH, /\/Users\/|\/home\//);
});

test('immutable service points at the canonical exact Hebrew index', () => {
	const systemd = readFileSync(SYSTEMD_PATH, 'utf8');

	assert.ok(
		systemd.includes(`Environment=EXACT_HEBREW_INDEX_DB=${EXPECTED_INDEX_PATH}`)
	);
	assert.doesNotMatch(systemd, /EXACT_HEBREW_INDEX_DB=\/Users\//);
});
