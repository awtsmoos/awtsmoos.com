//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCanonicalLauncher.test.js
 * @description Locks direct-world progress forwarding and silent localhost single-player networking into one canonical launch path.
 * The Awtsmoos opens one doorway and one veil hears its progress; Awtsmoos.com proves local study stays local
 * while the chosen runtime alone receives the progress signal appointed to reveal its construction.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	inferRealtimeUrl,
	launchMitzvahWorld
} from '../../src/launcher/MitzvahWorldLauncher.js';

const localEnvironment = Object.freeze({
	location: Object.freeze({
		host: '127.0.0.1:5192',
		hostname: '127.0.0.1',
		protocol: 'http:'
	})
});

test('B"H single-player forwards canonical page progress into only the selected mode', async () => {
	const events = [];
	const modeCalls = [];
	const onProgress = update => events.push(update);
	const modes = modeLoaders(modeCalls);
	const result = await launchMitzvahWorld(
		{ hud: { style: {} } },
		'?mode=world&session=singleplayer&worldId=main-village',
		{
			environment: localEnvironment,
			modeLoaders: modes,
			onProgress,
			setGameHostsVisible() {}
		}
	);
	assert.equal(result.mode, 'singleplayer');
	assert.equal(modeCalls.length, 1);
	assert.equal(modeCalls[0].mode, 'singleplayer');
	assert.equal(modeCalls[0].options.onProgress, onProgress);
	modeCalls[0].options.onProgress({ message: 'Terrain ready', progress: 0.72 });
	assert.deepEqual(events, [{ message: 'Terrain ready', progress: 0.72 }]);
});

test('multiplayer receives the same page progress callback without changing its route identity', async () => {
	const calls = [];
	const onProgress = () => {};
	const result = await launchMitzvahWorld(
		{},
		'?mode=world&session=multiplayer&worldId=shared-village',
		{
			environment: localEnvironment,
			modeLoaders: modeLoaders(calls),
			onProgress,
			setGameHostsVisible() {}
		}
	);
	assert.equal(result.mode, 'multiplayer');
	assert.equal(calls[0].options.onProgress, onProgress);
	assert.equal(calls[0].options.worldId, 'shared-village');
});

test('static localhost preview never invents a realtime WebSocket URL', () => {
	assert.equal(inferRealtimeUrl(localEnvironment.location), null);
});

function modeLoaders(calls) {
	return {
		materials: async () => ({ mode: 'materials' }),
		movie: async () => ({ mode: 'movie' }),
		multiplayer: async (_hosts, options) => record(calls, 'multiplayer', options),
		platform: async () => ({ mode: 'platform' }),
		singlePlayer: async (_hosts, options) => record(calls, 'singleplayer', options)
	};
}

function record(calls, mode, options) {
	calls.push({ mode, options });
	return { mode, options };
}
