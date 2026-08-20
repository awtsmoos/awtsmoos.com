// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtime_paths.test.mjs
 * @description
 * The Awtsmoos binds deployment and service startup to one exact Tanach path;
 * Awtsmoos.com tests the covenant so configuration drift cannot divide the aftermath.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
	DEFAULT_REMOTE_RAG_ROOT
} from './runtime_paths.mjs';

const EXPECTED_INDEX_PATH = path.posix.join(
	DEFAULT_REMOTE_RAG_ROOT,
	'tanach.hebrew.search.fs.awtsdb'
);
const SYSTEMD_PATH = new URL(
	'../../ops/systemd/awtsmoos-immutable.conf',
	import.meta.url
);

test('immutable service points at the canonical exact Tanach index', () => {
	const systemd = readFileSync(SYSTEMD_PATH, 'utf8');

	assert.match(
		systemd,
		new RegExp(
			`Environment=AWTSMOOS_TANACH_INDEX=${escapeRegExp(EXPECTED_INDEX_PATH)}`
		)
	);
	assert.match(EXPECTED_INDEX_PATH, /tanach\.hebrew\.search\.fs\.awtsdb$/);
});

/**
 * @param {string} value Literal text.
 * @returns {string} Regex-safe text.
 */
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
