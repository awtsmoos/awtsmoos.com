// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahStudioHandoff.test.js
 * @description Proves the studio handoff keeps its exact receipt behavior after the
 * boot-safety rework (heavy creator graph is lazy-loaded), and that its static
 * import graph stays tiny so importing it can never stall world entry.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { maybeApplyStudioHandoff } from './MitzvahStudioHandoff.js';

const HANDOFF_KEY = 'awtsmoos.mitzvahStudio.handoff.v1';
const SEARCH = '?studioHandoff=1';

function makeStorage(seed = {}) {
	const store = { ...seed };
	return {
		getItem: key => (key in store ? store[key] : null),
		setItem: (key, value) => { store[key] = value; },
		removeItem: key => { delete store[key]; },
		has: key => key in store
	};
}

function makeRuntime() {
	const runtime = {
		added: [],
		scene: { add(mesh) { runtime.added.push(mesh); } },
		mainOctree: { insert: () => true, remove: () => true }
	};
	return runtime;
}

function validDocument(objects) {
	return JSON.stringify({ format: 'awtsmoos.world.v1', name: 'test-handoff', objects });
}

const BOX = {
	catalogId: 'gen-test-box',
	shape: 'box',
	position: { x: 1, y: 2, z: 3 },
	size: { x: 2, y: 2, z: 2 },
	color: '#ff0000',
	label: 'Test Box'
};

test('static import graph stays tiny (root-cause regression: no heavy graph at import)', () => {
	const source = fs.readFileSync(new URL('./MitzvahStudioHandoff.js', import.meta.url), 'utf8');
	const staticImports = [...source.matchAll(/^\s*import\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/gm)]
		.map(match => match[1])
		.filter(specifier => specifier.startsWith('.'));
	assert.deepEqual(staticImports, [
		'../../../../../../libs/awtsmoos-procedural-core/src/core/universalApi/constants.js'
	]);
});

test('returns no-handoff-flag without the query flag', async () => {
	const receipt = await maybeApplyStudioHandoff({ environment: {}, search: '' });
	assert.equal(receipt.applied, false);
	assert.equal(receipt.reason, 'no-handoff-flag');
});

test('returns no-storage when localStorage is unavailable', async () => {
	const receipt = await maybeApplyStudioHandoff({ environment: {}, search: SEARCH });
	assert.equal(receipt.reason, 'no-storage');
});

test('returns no-handoff-document when the key is absent', async () => {
	const receipt = await maybeApplyStudioHandoff({ environment: { localStorage: makeStorage() }, search: SEARCH });
	assert.equal(receipt.reason, 'no-handoff-document');
});

test('returns handoff-json-invalid for corrupt JSON', async () => {
	const storage = makeStorage({ [HANDOFF_KEY]: 'not-json{{' });
	const receipt = await maybeApplyStudioHandoff({ environment: { localStorage: storage }, search: SEARCH });
	assert.equal(receipt.reason, 'handoff-json-invalid');
});

test('returns handoff-format-unsupported for the wrong format', async () => {
	const storage = makeStorage({ [HANDOFF_KEY]: JSON.stringify({ format: 'other.v1', objects: [] }) });
	const receipt = await maybeApplyStudioHandoff({ environment: { localStorage: storage }, search: SEARCH });
	assert.match(receipt.reason, /^handoff-format-unsupported/);
});

test('returns runtime-not-ready when the runtime lacks scene/octree', async () => {
	const storage = makeStorage({ [HANDOFF_KEY]: validDocument([BOX]) });
	const receipt = await maybeApplyStudioHandoff({
		runtime: {},
		environment: { localStorage: storage },
		search: SEARCH
	});
	assert.equal(receipt.reason, 'runtime-not-ready');
	assert.equal(receipt.name, 'test-handoff');
});

test('removes the key and reports no-convertible-objects when nothing converts', async () => {
	const storage = makeStorage({ [HANDOFF_KEY]: validDocument([{ nope: true }]) });
	const runtime = makeRuntime();
	const receipt = await maybeApplyStudioHandoff({
		runtime,
		environment: { localStorage: storage },
		search: SEARCH
	});
	assert.equal(receipt.reason, 'no-convertible-objects');
	assert.equal(receipt.skipped, 1);
	assert.equal(storage.has(HANDOFF_KEY), false);
});

test('mounts a valid handoff through the real lazy-loaded adapter', async () => {
	const storage = makeStorage({ [HANDOFF_KEY]: validDocument([BOX]) });
	const runtime = makeRuntime();
	const receipt = await maybeApplyStudioHandoff({
		runtime,
		environment: { localStorage: storage },
		search: SEARCH
	});
	assert.equal(receipt.applied, true);
	assert.equal(receipt.count, 1);
	assert.equal(receipt.skipped, 0);
	assert.equal(receipt.name, 'test-handoff');
	assert.equal(storage.has(HANDOFF_KEY), false);
	assert.equal(runtime.added.length, 1);
	assert.ok(runtime.mitzvahStudioHandoffAdapter, 'adapter is published on the runtime');
	assert.equal(runtime.mitzvahStudioHandoffAdapter.diagnostics().mounted, 1);
});

test('skips invalid objects but still mounts the valid ones', async () => {
	const storage = makeStorage({ [HANDOFF_KEY]: validDocument([{ nope: true }, BOX]) });
	const runtime = makeRuntime();
	const receipt = await maybeApplyStudioHandoff({
		runtime,
		environment: { localStorage: storage },
		search: SEARCH
	});
	assert.equal(receipt.applied, true);
	assert.equal(receipt.count, 1);
	assert.equal(receipt.skipped, 1);
});

test('never rejects: storage access throwing still yields a receipt', async () => {
	const throwing = {
		get localStorage() { throw new Error('denied'); }
	};
	const receipt = await maybeApplyStudioHandoff({ environment: throwing, search: SEARCH });
	assert.equal(receipt.applied, false);
	assert.ok(receipt.reason || receipt.error);
});
