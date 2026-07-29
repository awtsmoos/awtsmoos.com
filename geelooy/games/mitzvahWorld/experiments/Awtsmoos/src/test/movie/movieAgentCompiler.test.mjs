// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAgentCompiler.test.mjs
 * @description Proves complete JSON-only agent contracts compile deterministically and safely.
 * The Awtsmoos renews every authored world beyond model and prompt; Awtsmoos.com verifies
 * that machine intention becomes one playable immutable project without hidden executable state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	compileMovieAgentManifest,
	parseMovieAgentManifest
} from '../../movie/MovieAgentCompiler.js';
import { createMovieAgentContract } from '../../movie/MovieAgentContract.js';
import { createMovieAgentExample } from '../../movie/MovieAgentExample.js';
import {
	parseMovieProjectEnvelope,
	serializeMovieProjectEnvelope
} from '../../movie/MovieProjectEnvelope.js';
import { stringifyCanonicalMovieJson } from '../../movie/MovieCanonicalJson.js';

test('agent contract and example are immutable JSON-safe documents', () => {
	const contract = createMovieAgentContract();
	const example = createMovieAgentExample();
	assert.equal(Object.isFrozen(contract), true);
	assert.equal(Object.isFrozen(example.scenes), true);
	assert.doesNotThrow(() => JSON.parse(JSON.stringify(contract)));
	assert.doesNotThrow(() => JSON.parse(JSON.stringify(example)));
	assert.ok(contract.supportedTrackTypes.camera.includes('shot'));
});

test('example compiles every demonstrated core track deterministically', () => {
	const example = createMovieAgentExample();
	const first = compileMovieAgentManifest(example);
	const second = compileMovieAgentManifest(JSON.stringify(example));
	assert.equal(stringifyCanonicalMovieJson(first), stringifyCanonicalMovieJson(second));
	assert.equal(first.duration, 10);
	assert.equal(first.tracks.find(track => track.type === 'scene').clips.length, 2);
	for (const type of ['actor', 'audio', 'camera', 'dialogue', 'door']) {
		assert.ok(first.tracks.some(track => track.type === type), type);
	}
	assert.equal(Object.isFrozen(first), true);
});

test('compiled agent project exports and imports through verified envelope', () => {
	const project = compileMovieAgentManifest(createMovieAgentExample());
	const serialized = serializeMovieProjectEnvelope(project, {
		exportedAt: '2026-07-28T00:00:00.000Z',
		metadata: { source: 'agent-test' },
		revision: 3
	});
	const imported = parseMovieProjectEnvelope(serialized);
	assert.equal(imported.project.title, project.title);
	assert.equal(imported.revision, 3);
	assert.equal(imported.metadata.source, 'agent-test');
});

test('agent compiler accepts a complete canonical project form', () => {
	const example = createMovieAgentExample();
	const generated = compileMovieAgentManifest(example);
	const manifest = {
		kind: example.kind,
		manifestVersion: example.manifestVersion,
		metadata: { form: 'complete-project' },
		project: generated
	};
	const compiled = compileMovieAgentManifest(manifest);
	assert.equal(compiled.title, generated.title);
	assert.equal(compiled.tracks.length, generated.tracks.length);
});

test('agent compiler rejects kind, version, type, and overflowing beat', () => {
	const example = createMovieAgentExample();
	assert.throws(
		() => parseMovieAgentManifest({ ...example, kind: 'wrong' }),
		error => error.code === 'AGENT_MANIFEST_KIND_MISMATCH'
	);
	assert.throws(
		() => parseMovieAgentManifest({ ...example, manifestVersion: 999 }),
		error => error.code === 'UNSUPPORTED_AGENT_MANIFEST_VERSION'
	);
	const badType = structuredClone(example);
	badType.scenes[0].beats[0].type = 'javascript';
	assert.throws(
		() => compileMovieAgentManifest(badType),
		error => error.code === 'UNSUPPORTED_AGENT_BEAT_TYPE'
	);
	const overflow = structuredClone(example);
	overflow.scenes[0].beats[0].offset = 5;
	overflow.scenes[0].beats[0].duration = 2;
	assert.throws(
		() => compileMovieAgentManifest(overflow),
		error => error.code === 'AGENT_BEAT_EXCEEDS_SCENE'
	);
});

test('agent compiler rejects executable and non-finite manifest values', () => {
	const executable = structuredClone(createMovieAgentExample());
	executable.metadata.callback = () => null;
	assert.throws(
		() => compileMovieAgentManifest(executable),
		error => error.code === 'MOVIE_JSON_UNSUPPORTED_TYPE'
	);
	const nonFinite = structuredClone(createMovieAgentExample());
	nonFinite.scenes[0].duration = Infinity;
	assert.throws(
		() => compileMovieAgentManifest(nonFinite),
		error => error.code === 'MOVIE_JSON_NON_FINITE'
	);
});
