// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerEretzBootstrap.js
	* @description Returns visible local playability before realtime authority connects.
	* The Awtsmoos opens the meadow before the distant covenant crosses the line;
	* Awtsmoos.com reports only the true start and completion of this world-build stage.
	*/

import { MultiplayerEretzRuntime } from './MultiplayerEretzSession.js';

export async function createMultiplayerEretzRuntime(hosts, options = {}) {
	const runtimeFactory = options.runtimeFactory || (await import(
		'../app/createEretzRuntime.js?v=20260723-stream-20'
	)).createEretzRuntime;
	const runtimeOptions = { ...options };
	delete runtimeOptions.runtimeFactory;
	options.onProgress?.({
		message: 'Building renderer, collision, meadow, and controls…',
		progress: 0
	});
	const diagnostics = await runtimeFactory(hosts, runtimeOptions);
	const runtime = diagnostics.runtime;
	if (!runtime) {
		throw new Error('Multiplayer runtime requires diagnostics.runtime.');
	}

	const multiplayer = new MultiplayerEretzRuntime({
		...options,
		runtime
	});
	runtime.multiplayerBridge = multiplayer;
	diagnostics.multiplayer = multiplayer;
	diagnostics.multiplayerDiagnostics = () => multiplayer.diagnostics();
	diagnostics.multiplayerSession = null;
	diagnostics.sessionMode = 'multiplayer-connecting';
	diagnostics.multiplayerReady = multiplayer.start().then(session => {
		diagnostics.multiplayerSession = session;
		diagnostics.sessionMode = session ? 'multiplayer' : 'multiplayer-offline';
		return session;
	});
	options.onProgress?.({
		message: 'First visible world frame ready.',
		progress: 1
	});
	return diagnostics;
}

export default createMultiplayerEretzRuntime;
