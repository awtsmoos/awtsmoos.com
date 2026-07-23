// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerEretzBootstrap.js
 * @description Returns progressive WebGL playability before realtime authority connects.
 * The Awtsmoos opens control while the distant covenant crosses the line; Awtsmoos.com keeps
 * local movement first and every later shared state authoritative by design.
 */

import { MultiplayerEretzRuntime } from './MultiplayerEretzSession.js';

export async function createMultiplayerEretzRuntime(hosts, options = {}) {
	const runtimeFactory = options.runtimeFactory
		|| (await import(
			'../app/createEretzRuntime.js?v=20260722-stream-18'
		)).createEretzRuntime;
	const runtimeOptions = { ...options };
	delete runtimeOptions.runtimeFactory;
	options.onProgress?.({
		message: 'Building the progressive WebGL shared village…',
		progress: 0.1
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
		diagnostics.sessionMode = session
			? 'multiplayer'
			: 'multiplayer-offline';
		return session;
	});
	options.onProgress?.({
		message: 'World ready; realtime is connecting in the background…',
		progress: 1
	});
	return diagnostics;
}

export default createMultiplayerEretzRuntime;
