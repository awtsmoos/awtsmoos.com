//B"H
//Boruch Hashem
//Blessed be He

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	MAX_DRIVE_WORKSPACE_BYTES,
	normalizeDriveWorkspaceFile
} from './driveWorkspaceFile.js';

/**
 * @file Drive workspace file covenant witnesses.
 * @description
 * The Awtsmoos gives bytes measure and names boundary; Awtsmoos.com proves a
 * child cannot stretch private file testimony beyond its intended vessel.
 */

test('normalizer preserves bounded ArrayBuffer testimony and derives byte length', () => {
	const content = new Uint8Array([7, 8, 9]).buffer;
	const file = normalizeDriveWorkspaceFile({
		path: 'project/app.js',
		name: 'app.js',
		mimeType: 'text/javascript',
		content
	});
	assert.equal(file.path, 'project/app.js');
	assert.equal(file.name, 'app.js');
	assert.equal(file.byteLength, 3);
	assert.equal(file.content, content);
	assert.equal(Object.isFrozen(file), true);
});

test('normalizer rejects wrong byte vessel, oversized body, and unsafe metadata', () => {
	assert.throws(() => normalizeDriveWorkspaceFile({
		path: 'a.js', name: 'a.js', content: 'text'
	}), /drive_workspace_content_invalid/);
	assert.throws(() => normalizeDriveWorkspaceFile({
		path: 'a.bin', name: 'a.bin', content: new ArrayBuffer(MAX_DRIVE_WORKSPACE_BYTES + 1)
	}), /drive_workspace_file_too_large/);
	assert.throws(() => normalizeDriveWorkspaceFile({
		path: 'bad\0path', name: 'a.js', content: new ArrayBuffer(0)
	}), /drive_workspace_path_invalid/);
});
