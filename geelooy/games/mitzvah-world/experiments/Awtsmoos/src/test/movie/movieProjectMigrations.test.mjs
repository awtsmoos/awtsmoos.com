// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProjectMigrations.test.mjs
 * @description Proves pure ordered migration discovery, dry-run, custom steps, and failure safety.
 * The Awtsmoos renews every schema beyond old and new form; Awtsmoos.com verifies
 * each finite upgrade is explicit, serializable, ordered, and unable to mutate its source.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createDefaultMovieProjectMigrationRegistry,
	MovieProjectMigrationRegistry
} from '../../movie/MovieProjectMigrations.js';

function legacyProject() {
	return {
		duration: 8,
		fps: 24,
		resolution: { height: 540, width: 960 },
		title: 'Legacy',
		tracks: []
	};
}

test('default registry lists and applies schema one to two without source mutation', () => {
	const registry = createDefaultMovieProjectMigrationRegistry();
	const source = legacyProject();
	const result = registry.migrate(source);
	assert.equal(result.fromVersion, 1);
	assert.equal(result.toVersion, 2);
	assert.equal(result.applied[0].id, 'movie-schema-1-to-2');
	assert.equal(result.project.projectSchemaVersion, 2);
	assert.deepEqual(result.project.markers, []);
	assert.deepEqual(result.project.metadata, {});
	assert.equal(source.projectSchemaVersion, undefined);
	assert.equal(Object.isFrozen(result), true);
});

test('custom trusted migrations form an ordered path', () => {
	const registry = new MovieProjectMigrationRegistry();
	registry.register({ from: 1, id: 'one-two', to: 2 }, project => ({
		...project,
		stepOne: true
	}));
	registry.register({ from: 2, id: 'two-three', to: 3 }, project => ({
		...project,
		stepTwo: true
	}));
	const result = registry.migrate(legacyProject(), { toVersion: 3 });
	assert.deepEqual(result.applied.map(item => item.id), ['one-two', 'two-three']);
	assert.equal(result.project.stepOne, true);
	assert.equal(result.project.stepTwo, true);
	assert.equal(result.project.projectSchemaVersion, 3);
});

test('duplicate, malformed, and missing paths are coded failures', () => {
	const registry = new MovieProjectMigrationRegistry();
	registry.register({ from: 1, to: 2 }, project => project);
	assert.throws(
		() => registry.register({ from: 1, to: 3 }, project => project),
		error => error.code === 'DUPLICATE_MOVIE_MIGRATION'
	);
	assert.throws(
		() => registry.register({ from: 2, to: 2 }, project => project),
		error => error.code === 'INVALID_MOVIE_MIGRATION_MANIFEST'
	);
	assert.throws(
		() => registry.migrate(legacyProject(), { toVersion: 3 }),
		error => error.code === 'MOVIE_MIGRATION_PATH_NOT_FOUND'
	);
});
