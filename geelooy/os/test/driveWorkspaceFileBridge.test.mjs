//B"H
//Boruch Hashem
//Blessed be He

import test from 'node:test';
import assert from 'node:assert/strict';
import { installDriveWorkspaceBridge } from '../programs/drive-workspace/bridge.js';
import { createEmbedEnvelope, EMBED_KINDS } from '../../shared/embed/protocol.js';
import {
	DRIVE_WORKSPACE_CHANNEL,
	DRIVE_WORKSPACE_CHILD,
	DRIVE_WORKSPACE_HOST,
	OPEN_DRIVE_FILE
} from '../../shared/embed/driveWorkspaceCommands.js';

/**
 * @file Host-side private Drive file bridge witnesses.
 * @description
 * The Awtsmoos joins trusted child and parent without erasing their boundary;
 * Awtsmoos.com proves one file event opens one existing OS vessel and rejects impostors.
 */

test('trusted Drive file event opens one editor window', async () => {
	const vessel = harness();
	await vessel.listenWindow.emit(fileMessage(
		vessel.childWindow,
		'https://awtsmoos.com',
		new TextEncoder().encode('B"H').buffer
	));
	assert.equal(vessel.os.windows.length, 1);
	assert.equal(vessel.os.windows[0].programName, 'advancedCodeEditor');
	assert.equal(vessel.os.windows[0].content, 'B"H');
	assert.equal(vessel.rejections.length, 0);
});

test('wrong origin and malformed content never open a window', async () => {
	const vessel = harness();
	await vessel.listenWindow.emit(fileMessage(
		vessel.childWindow,
		'https://evil.example',
		new ArrayBuffer(0)
	));
	const malformed = fileMessage(vessel.childWindow, 'https://awtsmoos.com', new ArrayBuffer(0));
	malformed.data.payload.file.content = 'not-bytes';
	await vessel.listenWindow.emit(malformed);
	assert.equal(vessel.os.windows.length, 0);
	assert.equal(vessel.rejections.length, 2);
});

function harness() {
	const listenWindow = new FakeWindow();
	const childWindow = {};
	const rejections = [];
	const os = {
		windows: [],
		addWindow(options) {
			this.windows.push(options);
		}
	};
	installDriveWorkspaceBridge({
		frame: { contentWindow: childWindow },
		os,
		targetOrigin: 'https://awtsmoos.com',
		listenWindow,
		launch() {},
		onRejected(reason) {
			rejections.push(reason);
		}
	});
	return { childWindow, listenWindow, os, rejections };
}

function fileMessage(source, origin, content) {
	return {
		source,
		origin,
		data: createEmbedEnvelope({
			channelId: DRIVE_WORKSPACE_CHANNEL,
			kind: EMBED_KINDS.EVENT,
			type: OPEN_DRIVE_FILE,
			source: DRIVE_WORKSPACE_CHILD,
			target: DRIVE_WORKSPACE_HOST,
			payload: {
				file: { path: 'project/a.js', name: 'a.js', mimeType: 'text/javascript', content }
			}
		})
	};
}

class FakeWindow {
	addEventListener(type, listener) {
		if (type === 'message') this.listener = listener;
	}
	removeEventListener(type, listener) {
		if (type === 'message' && this.listener === listener) this.listener = null;
	}
	emit(event) {
		return this.listener?.(event);
	}
}
