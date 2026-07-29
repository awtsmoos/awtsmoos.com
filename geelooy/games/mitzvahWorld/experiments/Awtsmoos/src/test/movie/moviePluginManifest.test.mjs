// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePluginManifest.test.mjs
 * @description Proves immutable plugin and runtime-adapter manifests, permissions, IDs, and JSON safety.
 * The Awtsmoos renews extension beyond code and name; Awtsmoos.com verifies that public
 * manifests contain only bounded finite identity and capabilities while executable values are refused.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MOVIE_PLUGIN_PERMISSIONS,
	normalizeMoviePluginManifest
} from '../../movie/MoviePluginManifest.js';
import { normalizeMovieRuntimeAdapterManifest } from '../../movie/MovieRuntimeAdapterManifest.js';

test('plugin manifest normalizes permissions and serializes immutably', () => {
	const manifest = normalizeMoviePluginManifest({
		description: 'Test extension.',
		id: 'awtsmoos.test-plugin',
		name: 'Test Plugin',
		permissions: [
			'project.read',
			'commands.execute',
			'project.read'
		],
		version: '2.3.4'
	});
	assert.deepEqual(manifest.permissions, [
		'commands.execute',
		'project.read'
	]);
	assert.equal(manifest.kind, 'awtsmoos.movie.plugin-manifest');
	assert.equal(Object.isFrozen(manifest), true);
	assert.doesNotThrow(() => JSON.stringify(manifest));
	assert.ok(MOVIE_PLUGIN_PERMISSIONS.includes('commands.register'));
});

test('plugin manifest rejects unsafe IDs, permissions, and executable values', () => {
	assert.throws(
		() => normalizeMoviePluginManifest({ id: 'UPPER CASE' }),
		error => error.code === 'INVALID_MOVIE_PLUGIN_ID'
	);
	assert.throws(
		() => normalizeMoviePluginManifest({
			id: 'safe.plugin',
			permissions: ['project.destroy']
		}),
		error => error.code === 'UNKNOWN_MOVIE_PLUGIN_PERMISSION'
	);
	assert.throws(() => normalizeMoviePluginManifest({
		activate() {},
		id: 'safe.plugin'
	}));
});

test('runtime adapter manifest sorts capabilities and hides implementation', () => {
	const manifest = normalizeMovieRuntimeAdapterManifest({
		capabilities: ['write', 'read', 'write'],
		description: 'World bridge.',
		id: 'awtsmoos.world-bridge',
		ownerPluginId: 'awtsmoos.test-plugin',
		type: 'world.bridge',
		version: '1.2.0'
	});
	assert.deepEqual(manifest.capabilities, ['read', 'write']);
	assert.equal(manifest.kind, 'awtsmoos.movie.runtime-adapter');
	assert.equal(manifest.ownerPluginId, 'awtsmoos.test-plugin');
	assert.equal(Object.isFrozen(manifest), true);
	assert.doesNotThrow(() => JSON.stringify(manifest));
});

test('runtime adapter manifest rejects unsafe identity and type', () => {
	assert.throws(
		() => normalizeMovieRuntimeAdapterManifest({
			id: 'Bad Adapter',
			type: 'world'
		}),
		error => error.code === 'INVALID_MOVIE_RUNTIME_ADAPTER_ID'
	);
	assert.throws(
		() => normalizeMovieRuntimeAdapterManifest({
			id: 'safe.adapter',
			type: 'Bad Type'
		}),
		error => error.code === 'INVALID_MOVIE_RUNTIME_ADAPTER_TYPE'
	);
});
