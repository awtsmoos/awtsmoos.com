//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Proves immutable deployment state normalizes safely across old and hostile input.
 * @description
 * The Awtsmoos renews persisted state while Awtsmoos.com refuses traversal, private
 * publication, duplicate normalized paths, and unbounded manifests before they can
 * become production testimony.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	MAX_FILES_PER_DEPLOYMENT,
	normalizeDeploymentRecord
} = require('../deploymentPolicy.js');
const { normalizeDriveState } = require('../stateShape.js');

const HASH = 'a'.repeat(64);

/** Creates one valid immutable public manifest file. */
function file(overrides = {}) {
	return {
		type: 'file',
		objectHash: HASH,
		size: 12,
		visibility: 'public',
		...overrides
	};
}

test('version-six Drive state upgrades with an empty deployment registry', () => {
	const state = normalizeDriveState({ version: 6, entries: {}, sites: {} });
	assert.equal(state.version, 7);
	assert.deepEqual(state.deployments, {});
});

test('deployment normalization preserves public files and drops private records', () => {
	const deployment = normalizeDeploymentRecord('d-abc12345-deadbeef', {
		siteId: 'home',
		rootPath: 'sites/home',
		files: {
			'index.html': file(),
			'private.txt': file({ visibility: 'private' })
		}
	});
	assert.deepEqual(Object.keys(deployment.files), ['index.html']);
	assert.equal(deployment.fileCount, 1);
	assert.equal(deployment.totalBytes, 12);
});

test('deployment manifest rejects traversal and duplicate normalized paths', () => {
	assert.throws(
		() => normalizeDeploymentRecord('d-abc12345-deadbeef', {
			files: { '../escape.html': file() }
		}),
		error => error.code === 'PATH_TRAVERSAL'
	);
	assert.throws(
		() => normalizeDeploymentRecord('d-abc12345-deadbeef', {
			files: { 'a//b.html': file(), 'a/b.html': file() }
		}),
		error => error.code === 'DEPLOYMENT_DUPLICATE_PATH'
	);
});

test('deployment manifest refuses an entry count above the configured bound', () => {
	const files = {};
	for (let index = 0; index <= MAX_FILES_PER_DEPLOYMENT; index += 1) {
		files[`file-${index}.txt`] = file();
	}
	assert.throws(
		() => normalizeDeploymentRecord('d-abc12345-deadbeef', { files }),
		error => error.code === 'DEPLOYMENT_TOO_MANY_FILES'
	);
});

test('malformed stored deployment history is discarded during state normalization', () => {
	const state = normalizeDriveState({
		deployments: {
			bad: { files: { 'index.html': file() } },
			'd-abc12345-deadbeef': { files: { 'index.html': file() } }
		}
	});
	assert.deepEqual(Object.keys(state.deployments), ['d-abc12345-deadbeef']);
});
