//B"H
//Boruch Hashem
//Blessed be He

import test from 'node:test';
import assert from 'node:assert/strict';
import { launchDriveWorkspaceFile } from '../programs/drive-workspace/fileLauncher.js';

/**
 * @file Parent-side Drive file launch witnesses.
 * @description
 * The Awtsmoos lets content reveal its bounded vessel; Awtsmoos.com proves the
 * parent chooses the program and never asks VFS to interpret a server Drive path.
 */

test('text Drive file opens the existing code editor with decoded content', async () => {
	const os = fakeOs();
	const descriptor = await launchDriveWorkspaceFile(os, {
		path: 'project/app.js',
		name: 'app.js',
		mimeType: 'text/javascript',
		content: new TextEncoder().encode('const awtsmoos = true;').buffer
	});
	assert.equal(descriptor.programName, 'advancedCodeEditor');
	assert.equal(os.windows.length, 1);
	assert.equal(os.windows[0].content, 'const awtsmoos = true;');
	assert.equal(os.windows[0].filePath, 'project/app.js');
});

test('binary Drive file opens inspect-only binary viewer and preserves raw bytes', async () => {
	const os = fakeOs();
	const content = new Uint8Array([0, 255, 1]).buffer;
	const descriptor = await launchDriveWorkspaceFile(os, {
		path: 'project/blob.bin',
		name: 'blob.bin',
		mimeType: 'application/octet-stream',
		content
	});
	assert.equal(descriptor.programName, 'awtsmoosBinaryViewer');
	assert.equal(os.windows[0].content, content);
	assert.equal(os.windows[0].inspectOnly, true);
});

function fakeOs() {
	return {
		windows: [],
		addWindow(options) {
			this.windows.push(options);
		}
	};
}
