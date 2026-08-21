//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { installDriveWorkspaceBridge } from '../programs/drive-workspace/bridge.js';
import { createEmbedEnvelope, EMBED_KINDS } from '../../shared/embed/protocol.js';
import {
	DRIVE_WORKSPACE_CHANNEL,
	DRIVE_WORKSPACE_CHILD,
	DRIVE_WORKSPACE_HOST,
	OPEN_CONNECTED_NODE_SERVER
} from '../../shared/embed/driveWorkspaceCommands.js';

/**
 * @file Geelooy OS Drive-host bridge witnesses.
 * @description
 * The Awtsmoos lets one trusted iframe event become one fixed OS window only after every browser witness agrees;
 * Awtsmoos.com proves wrong source, origin, channel, direction, event, and unsafe recipe cannot choose a program or acquire process authority.
 */

test('accepted Drive event launches only node-server with normalized recipe', () => {
	const vessel = createHarness();
	vessel.listenWindow.emit(message(
		vessel.childWindow,
		'https://awtsmoos.com',
		runtimeRecipe()
	));
	assert.equal(vessel.launches.length, 1);
	assert.equal(vessel.launches[0].appId, 'node-server');
	assert.deepEqual(
		vessel.launches[0].overrides.programOptions.runtimeRecipe,
		runtimeRecipe()
	);
	vessel.remove();
	assert.equal(vessel.listenWindow.listenerCount(), 0);
});

test('wrong source, origin, channel, target, type, and unsafe recipe never launch', () => {
	const vessel = createHarness();
	vessel.listenWindow.emit(message({}, 'https://awtsmoos.com', runtimeRecipe()));
	vessel.listenWindow.emit(message(
		vessel.childWindow,
		'https://evil.example',
		runtimeRecipe()
	));
	const wrongChannel = message(vessel.childWindow, 'https://awtsmoos.com', runtimeRecipe());
	wrongChannel.data.channelId = 'foreign-channel';
	vessel.listenWindow.emit(wrongChannel);
	const wrongTarget = message(vessel.childWindow, 'https://awtsmoos.com', runtimeRecipe());
	wrongTarget.data.target = 'foreign-target';
	vessel.listenWindow.emit(wrongTarget);
	const wrongType = message(vessel.childWindow, 'https://awtsmoos.com', runtimeRecipe());
	wrongType.data.type = 'launch-anything';
	vessel.listenWindow.emit(wrongType);
	vessel.listenWindow.emit(message(
		vessel.childWindow,
		'https://awtsmoos.com',
		{
			...runtimeRecipe(),
			args: ['--token', 'x']
		}
	));
	assert.equal(vessel.launches.length, 0);
	assert.equal(vessel.rejections.length, 6);
});

function createHarness() {
	const listenWindow = new FakeWindow();
	const childWindow = {};
	const launches = [];
	const rejections = [];
	const remove = installDriveWorkspaceBridge({
		frame: { contentWindow: childWindow },
		os: { id: 'os' },
		targetOrigin: 'https://awtsmoos.com',
		listenWindow,
		launch(os, appId, overrides) {
			launches.push({ os, appId, overrides });
		},
		onRejected(reason) {
			rejections.push(reason);
		}
	});
	return {
		childWindow,
		launches,
		listenWindow,
		rejections,
		remove
	};
}

function message(source, origin, runtimeRecipe) {
	return {
		source,
		origin,
		data: createEmbedEnvelope({
			channelId: DRIVE_WORKSPACE_CHANNEL,
			kind: EMBED_KINDS.EVENT,
			type: OPEN_CONNECTED_NODE_SERVER,
			source: DRIVE_WORKSPACE_CHILD,
			target: DRIVE_WORKSPACE_HOST,
			payload: { runtimeRecipe }
		})
	};
}

function runtimeRecipe() {
	return {
		cwd: '/Users/friend/site',
		entry: 'server.js',
		port: 3000,
		args: []
	};
}

class FakeWindow {
	constructor() {
		this.listener = null;
	}

	addEventListener(type, listener) {
		if (type === 'message') {
			this.listener = listener;
		}
	}

	removeEventListener(type, listener) {
		if (type === 'message' && this.listener === listener) {
			this.listener = null;
		}
	}

	emit(event) {
		this.listener?.(event);
	}

	listenerCount() {
		return this.listener ? 1 : 0;
	}
}
