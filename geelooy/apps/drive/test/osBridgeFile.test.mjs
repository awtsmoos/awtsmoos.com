//B"H
//Boruch Hashem
//Blessed be He

import test from 'node:test';
import assert from 'node:assert/strict';
import { canUseDriveWorkspaceBridge, openDriveFile } from '../js/osBridge.js';
import { OPEN_DRIVE_FILE } from '../../../shared/embed/driveWorkspaceCommands.js';

/**
 * @file Drive child bridge file witnesses.
 * @description
 * The Awtsmoos makes parent and child distinct yet exact; Awtsmoos.com proves
 * private bytes move only through the declared same-origin OS embedding.
 */

test('trusted OS embed posts one bounded file event with transferable bytes', () => {
	const parent = new FakeParent();
	const context = browserContext(parent);
	assert.equal(canUseDriveWorkspaceBridge(context), true);
	const content = new Uint8Array([65, 66]).buffer;
	const result = openDriveFile({
		path: 'project/a.txt', name: 'a.txt', mimeType: 'text/plain', content
	}, context);
	assert.equal(result.ok, true);
	assert.equal(parent.messages.length, 1);
	assert.equal(parent.messages[0].message.type, OPEN_DRIVE_FILE);
	assert.equal(parent.messages[0].message.payload.file.content, content);
	assert.equal(parent.messages[0].targetOrigin, 'https://awtsmoos.com');
	assert.deepEqual(parent.messages[0].transfer, [content]);
});

test('non-OS embedding is rejected without posting', () => {
	const parent = new FakeParent();
	const context = browserContext(parent, '?embed=other');
	assert.equal(canUseDriveWorkspaceBridge(context), false);
	const result = openDriveFile({
		path: 'a.txt', name: 'a.txt', content: new ArrayBuffer(0)
	}, context);
	assert.equal(result.ok, false);
	assert.equal(parent.messages.length, 0);
});

function browserContext(parent, search = '?embed=awtsmoos-os&embedParent=geelooy-os&embedParentOrigin=https%3A%2F%2Fawtsmoos.com') {
	const href = `https://awtsmoos.com/apps/drive/${search}`;
	return {
		windowObject: { parent, location: { href, search } },
		documentObject: { referrer: 'https://awtsmoos.com/os/' },
		locationObject: { href, search }
	};
}

class FakeParent {
	constructor() {
		this.messages = [];
	}
	postMessage(message, targetOrigin, transfer) {
		this.messages.push({ message, targetOrigin, transfer });
	}
}
